'use client';

import { useEffect, useState, useMemo, memo, useCallback, useRef } from 'react';
import { apiClient, AssetPosition, Balance } from '@/lib/api';
import { useSolPrice } from '@/contexts/SolPriceContext';

interface AssetListProps {
  hideHeader?: boolean;
}

export default function AssetList({ hideHeader = false }: AssetListProps) {
  const [positions, setPositions] = useState<AssetPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const { solPrice } = useSolPrice(); // Context에서 가격 가져오기
  const hasInitiallyLoaded = useRef(false); // 초기 로드 완료 여부

  // Hydration 에러 방지: 클라이언트에서만 렌더링
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 자산 내역 가져오기 (초기 로드 및 주기적 갱신)
  useEffect(() => {
    if (!isMounted) return;

    const fetchPositions = async () => {
      if (!apiClient.isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        // 초기 로드 시에만 로딩 상태 표시 (주기적 갱신 시에는 로딩 표시 안 함)
        if (!hasInitiallyLoaded.current) {
          setLoading(true);
        }
        setError(null);
        
        // balances API를 우선 사용 (USDT 포함 보장)
        // 타임아웃 설정 (10초)
        const balancesResponse = await Promise.race([
          apiClient.getBalances(),
          new Promise<{ balances: Balance[] }>((_, reject) => 
            setTimeout(() => reject(new Error('잔고 조회 타임아웃')), 10000)
          )
        ]);
        
        // positions API에서 추가 정보 가져오기 (손익 등)
        let positionsData: AssetPosition[] = [];
        let positionsApiSuccess = false;
        try {
          const positionsResponse = await apiClient.getPositions();
          positionsData = positionsResponse.positions;
          positionsApiSuccess = true;
        } catch (positionsError) {
          // positions API 실패해도 계속 진행 (balances만 사용)
          console.log('Positions API를 사용할 수 없어 Balances만 사용합니다.');
        }
        
        // 이전 positions state에서 average_entry_price 가져오기 (positions API 실패 시 사용)
        const prevPositionsMap = new Map(positions.map(p => [p.mint, p]));
        
        // balances를 positions 형식으로 변환하고, positions API 데이터와 병합
        const convertedPositions: AssetPosition[] = balancesResponse.balances
          .map(b => {
            const balance = parseFloat(b.available) + parseFloat(b.locked);
            
            // positions API에서 해당 mint의 데이터 찾기
            const positionData = positionsData.find(p => p.mint === b.mint_address);
            
            // positions API 실패 시 이전 positions에서 average_entry_price 가져오기
            const prevPosition = prevPositionsMap.get(b.mint_address);
            
            // SOL의 경우 바이낸스 가격 사용, USDT는 1, 그 외는 positions API 가격 사용
            let marketPrice: string | null = null;
            let value: string | null = null;
            
            if (b.mint_address === 'USDT') {
              marketPrice = '1';
              value = balance.toString();
            } else if (b.mint_address === 'SOL' && solPrice) {
              marketPrice = solPrice.toString();
              value = (solPrice * balance).toString();
            } else if (positionData?.current_market_price) {
              marketPrice = positionData.current_market_price;
              value = positionData.current_value || null;
            }
            
            // 손익은 백엔드에서 받은 값을 우선 사용 (백엔드가 정확한 계산을 수행)
            // 프론트엔드에서 재계산하지 않음 (백엔드의 total_bought_cost와 정확한 계산 로직 사용)
            let finalPnl: string | null = positionData?.unrealized_pnl || null;
            let finalPnlPercent: string | null = positionData?.unrealized_pnl_percent || null;
            
            // 백엔드에서 값을 받지 못한 경우에만 이전 값 사용 (재계산하지 않음)
            if (!finalPnl && prevPosition?.unrealized_pnl) {
              finalPnl = prevPosition.unrealized_pnl;
            }
            if (!finalPnlPercent && prevPosition?.unrealized_pnl_percent) {
              finalPnlPercent = prevPosition.unrealized_pnl_percent;
            }
            
            return {
              mint: b.mint_address,
              current_balance: balance.toString(),
              available: b.available,
              locked: b.locked,
              // average_entry_price는 positions API가 성공했을 때만 새로운 값 사용
              // 매수/매도 직후 positions API가 아직 업데이트되지 않았을 수 있으므로 이전 값 유지
              average_entry_price: positionsApiSuccess && positionData?.average_entry_price 
                ? positionData.average_entry_price 
                : prevPosition?.average_entry_price || null,
              total_bought_amount: positionsApiSuccess && positionData?.total_bought_amount 
                ? positionData.total_bought_amount 
                : prevPosition?.total_bought_amount || '0',
              total_bought_cost: positionsApiSuccess && positionData?.total_bought_cost 
                ? positionData.total_bought_cost 
                : prevPosition?.total_bought_cost || '0',
              current_market_price: marketPrice,
              current_value: value,
              unrealized_pnl: finalPnl,
              unrealized_pnl_percent: finalPnlPercent,
              trade_summary: positionsApiSuccess && positionData?.trade_summary 
                ? positionData.trade_summary 
                : prevPosition?.trade_summary || {
                    total_buy_trades: 0,
                    total_sell_trades: 0,
                    realized_pnl: '0',
                  },
            };
          });
        
        // USDT를 최상단에 고정
        const sortedPositions = convertedPositions.sort((a, b) => {
          if (a.mint === 'USDT') return -1;
          if (b.mint === 'USDT') return 1;
          return a.mint.localeCompare(b.mint); // 나머지는 알파벳 순
        });
        
        // 깜빡임 완전 제거: 실제로 변경된 position만 업데이트
        setPositions(prevPositions => {
          // 길이가 다르면 업데이트
          if (prevPositions.length !== sortedPositions.length) {
            return sortedPositions;
          }
          
          // 각 position을 비교해서 실제로 변경된 것만 새 배열에 포함
          const updatedPositions = sortedPositions.map((newPos, index) => {
            const oldPos = prevPositions[index];
            if (!oldPos) return newPos;
            
            // SOL의 경우: 핵심 필드만 비교 (가격/손익은 solPrice useEffect에서 처리)
            if (newPos.mint === 'SOL') {
              const hasCoreChanges = (
                oldPos.mint !== newPos.mint ||
                oldPos.available !== newPos.available ||
                oldPos.locked !== newPos.locked ||
                oldPos.current_balance !== newPos.current_balance ||
                oldPos.average_entry_price !== newPos.average_entry_price
              );
              // 핵심 필드가 변경되지 않았으면 이전 position 유지 (가격/손익은 solPrice useEffect에서 업데이트)
              return hasCoreChanges ? newPos : oldPos;
            } else {
              // 다른 자산: 모든 필드 비교
              const hasChanges = (
                oldPos.mint !== newPos.mint ||
                oldPos.available !== newPos.available ||
                oldPos.locked !== newPos.locked ||
                oldPos.current_balance !== newPos.current_balance ||
                oldPos.current_market_price !== newPos.current_market_price ||
                oldPos.current_value !== newPos.current_value ||
                oldPos.average_entry_price !== newPos.average_entry_price ||
                oldPos.unrealized_pnl !== newPos.unrealized_pnl ||
                oldPos.unrealized_pnl_percent !== newPos.unrealized_pnl_percent
              );
              return hasChanges ? newPos : oldPos;
            }
          });
          
          // 배열 참조가 변경되지 않았는지 확인 (모든 position이 동일하면 이전 배열 반환)
          const allSame = updatedPositions.every((pos, index) => pos === prevPositions[index]);
          return allSame ? prevPositions : updatedPositions;
        });
        
        // 초기 로드 완료 표시
        hasInitiallyLoaded.current = true;
        setLoading(false); // 성공 시 로딩 해제
      } catch (err) {
        console.error('자산 내역 로딩 실패:', err);
        
        // 401 에러만 처리 (인증 문제)
        if (err instanceof Error) {
          if (err.message.includes('401') || err.message.includes('Unauthorized')) {
            setError('인증이 필요합니다. 다시 로그인해주세요.');
            setLoading(false);
            return;
          }
        }
        
        // 네트워크 에러나 타임아웃인 경우에만 로딩 유지
        // 그 외의 경우(예: 500 에러 등)에는 로딩 해제하고 에러 표시
        if (err instanceof Error) {
          const isNetworkError = 
            err.message.includes('fetch') || 
            err.message.includes('network') ||
            err.message.includes('타임아웃') ||
            err.message.includes('timeout');
          
          if (!isNetworkError) {
            // 네트워크 에러가 아닌 경우 로딩 해제
            setLoading(false);
            setError('자산 정보를 불러오는 중 오류가 발생했습니다.');
          }
          // 네트워크 에러인 경우 로딩 상태 유지 (재시도 가능)
        } else {
          // 알 수 없는 에러인 경우 로딩 해제
          setLoading(false);
        }
      }
    };

    fetchPositions();

    // 10초마다 자산 내역 갱신 (5초 -> 10초로 변경하여 깜빡임 감소)
    const interval = setInterval(fetchPositions, 10000);

    return () => clearInterval(interval);
  }, [isMounted]); // solPrice 제거 - 가격 변경 시에는 positions를 다시 가져오지 않음

  // solPrice 변경 시 기존 positions의 평가액만 업데이트 (깜빡임 완전 제거)
  useEffect(() => {
    if (!solPrice || positions.length === 0) return;

    setPositions(prevPositions => {
      // SOL position 찾기
      const solIndex = prevPositions.findIndex(p => p.mint === 'SOL');
      if (solIndex === -1) return prevPositions;
      
      const solPosition = prevPositions[solIndex];
      const balance = parseFloat(solPosition.current_balance);
      // 소수점 2자리로 제한하여 미세한 가격 변동으로 인한 깜빡임 방지
      const roundedPrice = Math.round(solPrice * 100) / 100;
      const newMarketPrice = roundedPrice.toString();
      const newValue = (roundedPrice * balance).toFixed(2);
      
      // 가격이나 평가액이 실제로 변경되었는지 확인 (소수점 2자리 기준)
      const oldPrice = solPosition.current_market_price ? parseFloat(solPosition.current_market_price) : 0;
      const oldValue = solPosition.current_value ? parseFloat(solPosition.current_value) : 0;
      
      // 가격이 변경되었는지 확인 (0.0001 USDT 이상 차이면 업데이트 - 실시간 반영 강화)
      // solPrice는 Context에서 실시간으로 업데이트되므로, 작은 차이도 반영해야 함
      const priceChanged = Math.abs(oldPrice - roundedPrice) >= 0.0001;
      const valueChanged = Math.abs(oldValue - parseFloat(newValue)) >= 0.01;
      
      if (!priceChanged && !valueChanged) {
        return prevPositions; // 변경사항 없으면 이전 상태 유지
      }
      
      // SOL position만 업데이트 (배열 참조 최소화)
      const updatedSolPosition = { ...solPosition };
      let needsUpdate = false;
      
      // 가격/평가액 업데이트 (solPrice가 변경되었으면 항상 업데이트)
      // solPrice는 Context에서 실시간으로 업데이트되므로, 항상 최신 가격 반영
      updatedSolPosition.current_market_price = newMarketPrice;
      updatedSolPosition.current_value = newValue;
      needsUpdate = true;
      
      // 손익 재계산 (백엔드 계산 방식과 동일: (현재가 - 평균 매수가) / 평균 매수가 × 100)
      // 주의: positions API가 아직 업데이트되지 않았을 수 있으므로, 
      // total_bought_cost가 유효하고 평균 매수가와 일관성이 있는 경우에만 재계산
      if (updatedSolPosition.average_entry_price && parseFloat(updatedSolPosition.current_balance) > 0) {
        const averageEntryPrice = parseFloat(updatedSolPosition.average_entry_price);
        const currentPrice = parseFloat(newMarketPrice);
        const totalBalance = parseFloat(updatedSolPosition.current_balance);
        const totalBoughtCost = updatedSolPosition.total_bought_cost 
          ? parseFloat(updatedSolPosition.total_bought_cost) 
          : null;
        
        // total_bought_cost가 유효하고, 평균 매수가와 일관성이 있는 경우에만 재계산
        // 일관성 체크: total_bought_cost ≈ average_entry_price × current_balance (20% 오차 허용 - 매도 후에도 작동)
        // 매수/매도 직후에는 positions API가 아직 업데이트되지 않았을 수 있어서,
        // total_bought_cost가 평균 매수가와 일관성이 없으면 재계산하지 않음
        const expectedTotalCost = averageEntryPrice * totalBalance;
        const isCostValid = totalBoughtCost && totalBoughtCost > 0;
        // 매도 후에는 total_bought_cost > expectedTotalCost가 될 수 있으므로 오차 허용 범위 확대
        const isCostConsistent = isCostValid && Math.abs(totalBoughtCost - expectedTotalCost) < expectedTotalCost * 0.2;
        
        // total_bought_cost가 없어도 평균 매수가가 있으면 재계산 (가격 변동 추적)
        if (averageEntryPrice > 0 && (isCostConsistent || !totalBoughtCost)) {
          // 백엔드 계산 방식: (현재가 - 평균 매수가) / 평균 매수가 × 100
          const newUnrealizedPnlPercent = ((currentPrice - averageEntryPrice) / averageEntryPrice * 100).toFixed(2);
          
          // 미실현 손익 = (현재 평가액 - 평균 매수가 × 보유량)
          const currentValue = parseFloat(newValue);
          const newUnrealizedPnl = (currentValue - expectedTotalCost).toFixed(2);
          
          // 손익이 실제로 변경되었는지 확인 (0.01% 이하 차이는 무시 - 빠른 가격 변동 대응)
          const oldPnl = updatedSolPosition.unrealized_pnl ? parseFloat(updatedSolPosition.unrealized_pnl) : 0;
          const oldPnlPercent = updatedSolPosition.unrealized_pnl_percent ? parseFloat(updatedSolPosition.unrealized_pnl_percent) : 0;
          
          if (
            Math.abs(oldPnl - parseFloat(newUnrealizedPnl)) >= 0.01 ||
            Math.abs(oldPnlPercent - parseFloat(newUnrealizedPnlPercent)) >= 0.01
          ) {
            updatedSolPosition.unrealized_pnl = newUnrealizedPnl;
            updatedSolPosition.unrealized_pnl_percent = newUnrealizedPnlPercent;
            needsUpdate = true;
          }
        }
        // total_bought_cost가 일관성이 없으면 재계산하지 않음 (positions API가 아직 업데이트되지 않았을 수 있음)
        // 이전 값을 유지하여 중간 상태가 보이지 않도록 함
      }
      
      // 실제로 변경사항이 없으면 이전 배열 반환
      if (!needsUpdate) {
        return prevPositions;
      }
      
      // SOL position만 새 객체로 교체 (나머지는 이전 참조 유지)
      const newPositions = [...prevPositions];
      newPositions[solIndex] = updatedSolPosition;
      return newPositions;
    });
  }, [solPrice]); // solPrice만 의존 - positions는 의존성에서 제외

  // formatNumber와 formatCurrency를 useCallback으로 메모이제이션 (깜빡임 방지)
  const formatNumber = useCallback((value: string | null | undefined, decimals: number = 2): string => {
    if (!value) return '--';
    const num = parseFloat(value);
    if (isNaN(num)) return '--';
    return num.toFixed(decimals);
  }, []);

  const formatCurrency = useCallback((value: string | null | undefined): string => {
    if (!value) return '--';
    const num = parseFloat(value);
    if (isNaN(num)) return '--';
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, []);

  // Hydration 에러 방지: 클라이언트 마운트 전에는 빈 div 반환
  if (!isMounted) {
    return (
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col h-full">
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <h3 className="text-base font-semibold text-white">자산 내역</h3>
        </div>
      </div>
    );
  }

  if (!apiClient.isAuthenticated()) {
    return (
      <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 flex items-center justify-center">
        <p className="text-gray-400 text-sm">로그인이 필요합니다</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col h-full">
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <h3 className="text-base font-semibold text-white">자산 내역</h3>
        </div>
        <div className="text-gray-400 text-center py-4 text-sm">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col h-full">
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <h3 className="text-base font-semibold text-white">자산 내역</h3>
        </div>
        <div className="text-red-400 text-center py-4 text-sm px-4">{error}</div>
      </div>
    );
  }

  // 모바일 드로어 모드 (hideHeader가 true일 때)
  if (hideHeader) {
    return (
      <div className="w-full">
        {loading ? (
          <div className="text-gray-400 text-center py-8 text-sm">로딩 중...</div>
        ) : error ? (
          <div className="text-red-400 text-center py-8 text-sm px-4">{error}</div>
        ) : positions.length === 0 ? (
          <div className="text-gray-400 text-center py-8 text-sm">
            보유한 자산이 없습니다
          </div>
        ) : (
          <div className="space-y-3">
            {positions.map((position) => {
              return <PositionItem key={position.mint} position={position} solPrice={position.mint === 'SOL' ? solPrice : null} formatNumber={formatNumber} formatCurrency={formatCurrency} isMobile={true} />;
            })}
          </div>
        )}
      </div>
    );
  }

  // 데스크톱 사이드바 모드
  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col h-full">
      <div className="p-4 border-b border-gray-700 flex-shrink-0">
        <h3 className="text-base font-semibold text-white">자산 내역</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {positions.length === 0 ? (
          <div className="p-4 text-gray-400 text-center text-sm">
            보유한 자산이 없습니다
          </div>
        ) : (
          <div className="p-4">
            {positions.map((position) => {
              return <PositionItem key={position.mint} position={position} solPrice={position.mint === 'SOL' ? solPrice : null} formatNumber={formatNumber} formatCurrency={formatCurrency} isMobile={false} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// 개별 Position 항목을 메모이제이션하여 불필요한 리렌더링 방지
const PositionItem = memo(({ position, solPrice, formatNumber, formatCurrency, isMobile = false }: {
  position: AssetPosition;
  solPrice: number | null;
  formatNumber: (value: string | null | undefined, decimals?: number) => string;
  formatCurrency: (value: string | null | undefined) => string;
  isMobile?: boolean;
}) => {
  const pnl = position.unrealized_pnl ? parseFloat(position.unrealized_pnl) : 0;
  const pnlPercent = position.unrealized_pnl_percent ? parseFloat(position.unrealized_pnl_percent) : 0;
  const isProfit = pnl >= 0;

  // 평가액 계산
  let calculatedValue: number | null = null;
  if (position.mint === 'SOL' && solPrice) {
    calculatedValue = solPrice * parseFloat(position.current_balance);
  } else if (position.current_value) {
    calculatedValue = parseFloat(position.current_value);
  } else if (position.current_market_price) {
    calculatedValue = parseFloat(position.current_market_price) * parseFloat(position.current_balance);
  } else if (position.mint === 'USDT') {
    calculatedValue = parseFloat(position.current_balance);
  }

  const price = position.mint === 'SOL' && solPrice 
    ? solPrice 
    : position.current_market_price 
      ? parseFloat(position.current_market_price) 
      : null;

  // 모바일 표 형태 레이아웃
  if (isMobile) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-800 border-b border-gray-700">
              <th colSpan={2} className="px-4 py-3 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-base">{position.mint}</span>
                  {position.mint === 'SOL' && position.unrealized_pnl_percent !== null && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      parseFloat(position.unrealized_pnl_percent) >= 0 
                        ? 'text-red-400 bg-red-400/10' 
                        : 'text-blue-400 bg-blue-400/10'
                    }`}>
                      {parseFloat(position.unrealized_pnl_percent) >= 0 ? '+' : ''}
                      {formatNumber(position.unrealized_pnl_percent)}%
                    </span>
                  )}
                  {price && (
                    <span className="text-gray-300 font-medium text-sm ml-auto">
                      ${formatNumber(price.toString())}
                    </span>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            <tr>
              <td className="px-4 py-2 text-gray-400 text-sm">사용 가능</td>
              <td className="px-4 py-2 text-white font-semibold text-sm text-right">
                {formatNumber(position.available, position.mint === 'USDT' ? 2 : 4)} {position.mint}
              </td>
            </tr>
            {parseFloat(position.locked) > 0 && (
              <tr>
                <td className="px-4 py-2 text-gray-400 text-sm">잠김</td>
                <td className="px-4 py-2 text-gray-300 text-sm text-right">
                  {formatNumber(position.locked, position.mint === 'USDT' ? 2 : 4)} {position.mint}
                </td>
              </tr>
            )}
            <tr className="bg-gray-800/50">
              <td className="px-4 py-2 text-gray-300 font-medium text-sm">총 보유</td>
              <td className="px-4 py-2 text-white font-bold text-sm text-right">
                {formatNumber(position.current_balance, position.mint === 'USDT' ? 2 : 4)} {position.mint}
              </td>
            </tr>
            {calculatedValue !== null && (
              <tr>
                <td className="px-4 py-2 text-gray-400 text-sm">평가액</td>
                <td className="px-4 py-2 text-white font-semibold text-sm text-right">
                  {formatCurrency(calculatedValue.toString())}
                </td>
              </tr>
            )}
            {position.average_entry_price && (
              <tr>
                <td className="px-4 py-2 text-gray-400 text-sm">평균 매수가</td>
                <td className="px-4 py-2 text-gray-300 text-sm text-right">
                  ${formatNumber(position.average_entry_price)}
                </td>
              </tr>
            )}
            {position.unrealized_pnl !== null && position.unrealized_pnl_percent !== null && (
              <tr className="bg-gray-800/30">
                <td className="px-4 py-2 text-gray-400 text-sm">손익</td>
                <td className="px-4 py-2 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className={`font-bold text-sm ${isProfit ? 'text-red-400' : 'text-blue-400'}`}>
                      {isProfit ? '+' : ''}{formatCurrency(position.unrealized_pnl)}
                    </span>
                    <span className={`font-semibold text-xs ${isProfit ? 'text-red-400' : 'text-blue-400'}`}>
                      ({isProfit ? '+' : ''}{formatNumber(position.unrealized_pnl_percent)}%)
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  // 데스크톱 카드 형태 레이아웃
  return (
    <div className="p-4 mb-3 bg-gray-900 rounded-xl border border-gray-700 hover:border-gray-600 transition-all shadow-sm">
      {/* 헤더: 자산명, 수익률, 현재가 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-base">{position.mint}</span>
          {position.mint === 'SOL' && position.unrealized_pnl_percent !== null && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
              parseFloat(position.unrealized_pnl_percent) >= 0 
                ? 'text-red-400 bg-red-400/10' 
                : 'text-blue-400 bg-blue-400/10'
            }`}>
              {parseFloat(position.unrealized_pnl_percent) >= 0 ? '+' : ''}
              {formatNumber(position.unrealized_pnl_percent)}%
            </span>
          )}
        </div>
        {price && (
          <span className="text-gray-300 font-medium text-sm">
            ${formatNumber(price.toString())}
          </span>
        )}
      </div>

      {/* 보유 수량 섹션 */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-xs">사용 가능</span>
          <span className="text-white font-semibold text-sm">
            {formatNumber(position.available, position.mint === 'USDT' ? 2 : 4)} {position.mint}
          </span>
        </div>
        {parseFloat(position.locked) > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-xs">잠김</span>
            <span className="text-gray-400 text-sm">
              {formatNumber(position.locked, position.mint === 'USDT' ? 2 : 4)} {position.mint}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-gray-700">
          <span className="text-gray-400 text-xs font-medium">총 보유</span>
          <span className="text-gray-200 font-semibold text-sm">
            {formatNumber(position.current_balance, position.mint === 'USDT' ? 2 : 4)} {position.mint}
          </span>
        </div>
      </div>

      {/* 평가액 및 평균 매수가 */}
      <div className="space-y-2 mb-4 pb-4 border-b border-gray-700">
        {calculatedValue !== null && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs">평가액</span>
            <span className="text-white font-semibold text-sm">
              {formatCurrency(calculatedValue.toString())}
            </span>
          </div>
        )}
        {position.average_entry_price && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs">평균 매수가</span>
            <span className="text-gray-300 text-sm">
              ${formatNumber(position.average_entry_price)}
            </span>
          </div>
        )}
      </div>

      {/* 손익 */}
      {position.unrealized_pnl !== null && position.unrealized_pnl_percent !== null && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-gray-400 text-xs">손익</span>
          <div className="flex items-center gap-2">
            <span className={`font-bold text-sm ${isProfit ? 'text-red-400' : 'text-blue-400'}`}>
              {isProfit ? '+' : ''}{formatCurrency(position.unrealized_pnl)}
            </span>
            <span className={`font-semibold text-xs ${isProfit ? 'text-red-400' : 'text-blue-400'}`}>
              ({isProfit ? '+' : ''}{formatNumber(position.unrealized_pnl_percent)}%)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // 깊은 비교를 통해 실제로 변경된 경우에만 리렌더링
  const prev = prevProps.position;
  const next = nextProps.position;
  
  // position 객체 참조가 같으면 리렌더링 안 함
  if (prev === next) return true;
  
  // SOL의 경우: solPrice 변경 체크
  if (prev.mint === 'SOL' && next.mint === 'SOL') {
    const prevPrice = prevProps.solPrice;
    const nextPrice = nextProps.solPrice;
    // solPrice가 변경되었으면 항상 리렌더링 (실시간 가격 반영 - 임계값 제거)
    if (prevPrice !== nextPrice && nextPrice !== null) {
      return false; // 리렌더링 필요
    }
    
    // SOL: 핵심 필드만 비교 (가격/손익은 solPrice useEffect에서 처리)
    return (
      prev.available === next.available &&
      prev.locked === next.locked &&
      prev.current_balance === next.current_balance &&
      prev.average_entry_price === next.average_entry_price &&
      prev.unrealized_pnl === next.unrealized_pnl &&
      prev.unrealized_pnl_percent === next.unrealized_pnl_percent
    );
  }
  
  // 다른 자산: 모든 필드 비교
  return (
    prev.mint === next.mint &&
    prev.available === next.available &&
    prev.locked === next.locked &&
    prev.current_balance === next.current_balance &&
    prev.current_market_price === next.current_market_price &&
    prev.current_value === next.current_value &&
    prev.average_entry_price === next.average_entry_price &&
    prev.unrealized_pnl === next.unrealized_pnl &&
    prev.unrealized_pnl_percent === next.unrealized_pnl_percent
  );
});

