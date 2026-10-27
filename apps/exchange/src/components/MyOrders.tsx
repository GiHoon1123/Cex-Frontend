'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient, Order } from '@/lib/api';

interface MyOrdersProps {
  filterStatus?: string[]; // 필터링할 상태 목록 (예: ['pending', 'partial'] 또는 ['filled'])
}

export default function MyOrders({ filterStatus }: MyOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  // 조회 함수는 상태를 바꾸지 않고 데이터만 돌려준다. 효과의 구독 콜백과
  // 취소 버튼이 같은 조회를 사용하되, 정리된 구독은 화면을 갱신하지 않는다.
  const fetchOrders = useCallback(async () => {
    if (!apiClient.isAuthenticated()) return [];
    const allOrders = filterStatus?.length
      ? (await Promise.all(filterStatus.map(status => apiClient.getMyOrders(status, 1000, 0)))).flat()
      : await apiClient.getMyOrders(undefined, 1000, 0);
    return allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [filterStatus]);

  useEffect(() => {
    let stopped = false;
    const refresh = () => {
      void fetchOrders().then(next => {
        if (stopped) return;
        setOrders(next); setError(null); setLoading(false);
      }).catch(() => {
        if (stopped) return;
        setError('주문 목록 조회 실패 · 마지막 조회 상태'); setLoading(false);
      });
    };
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => { stopped = true; clearInterval(interval); };
  }, [fetchOrders]);

  const handleCancel = async (orderId: string) => {
    if (!confirm('정말 이 주문을 취소하시겠습니까?')) {
      return;
    }

    setCancelingId(orderId);
    try {
      console.log('주문 취소 시도:', { orderId, order: orders.find(o => o.id === orderId) });
      await apiClient.cancelOrder(orderId);
      // 주문 목록 갱신
      setOrders(await fetchOrders());
    } catch (err) {
      console.error('주문 취소 실패:', err);
      let errorMessage = '주문 취소에 실패했습니다.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // 더 친화적인 에러 메시지
        if (err.message.includes('Unauthorized') || err.message.includes("don't own")) {
          errorMessage = '이 주문을 취소할 권한이 없습니다. 주문이 이미 완전히 체결되었거나 다른 사용자의 주문일 수 있습니다.';
        } else if (err.message.includes('not found')) {
          errorMessage = '주문을 찾을 수 없습니다. 이미 취소되었거나 완전히 체결되었을 수 있습니다.';
        } else if (err.message.includes('already fully filled')) {
          errorMessage = '이미 완전히 체결된 주문은 취소할 수 없습니다.';
        } else if (err.message.includes('already cancelled')) {
          errorMessage = '이미 취소된 주문입니다.';
        }
      }
      
      alert(errorMessage);
    } finally {
      setCancelingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400';
      case 'partial':
        return 'text-blue-400';
      case 'filled':
        return 'text-green-400';
      case 'cancelled':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '대기중';
      case 'partial':
        return '부분체결';
      case 'filled':
        return '체결완료';
      case 'cancelled':
        return '취소됨';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="text-gray-400 text-center py-4">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col">
        <div className="text-red-400 text-center py-4 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      
      <div className="flex-1 overflow-y-auto">
        {orders.length === 0 ? (
          <div className="text-gray-400 text-center py-8 text-sm">주문 내역이 없습니다.</div>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => {
              const filledPercent = order.amount !== '0' 
                ? (parseFloat(order.filledAmount) / parseFloat(order.amount)) * 100
                : 0;
              const isBuy = order.orderType === 'buy';
              
              return (
                <div
                  key={order.id}
                  className="bg-gray-900 rounded-lg border border-gray-700 p-3 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        isBuy ? 'bg-red-600/20 text-red-400' : 'bg-blue-600/20 text-blue-400'
                      }`}>
                        {isBuy ? '매수' : '매도'}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded bg-gray-700 text-gray-300`}>
                        {order.orderSide === 'limit' ? '지정가' : '시장가'}
                      </span>
                      <span className={`text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(order.createdAt)}</span>
                  </div>

                  {/* 체결 탭에서는 수량/체결률 제거, 미체결 탭에서는 표시 */}
                  {filterStatus?.includes('filled') ? (
                    // 체결 탭: filledQuoteAmount 사용 (시장가/지정가 모두)
                    (() => {
                      const isMarket = order.orderSide === 'market';
                      const isMarketBuy = isMarket && order.orderType === 'buy';
                      const isMarketSell = isMarket && order.orderType === 'sell';
                      
                      // filledQuoteAmount 사용 (백엔드에서 계산된 값)
                      const filledQuoteAmount = parseFloat(order.filledQuoteAmount) || 0;
                      
                      // 지정가 주문: 가격 × 체결 수량 (참고용, filledQuoteAmount가 0일 때만)
                      const totalFromPrice = order.price && parseFloat(order.filledAmount) > 0
                        ? parseFloat(order.price) * parseFloat(order.filledAmount)
                        : 0;
                      
                      return (
                        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                          {isMarketBuy ? (
                            <>
                              <div>
                                <span className="text-gray-400">체결 수량:</span>
                                <span className="text-white ml-2">
                                  {parseFloat(order.filledAmount) > 0
                                    ? `${parseFloat(order.filledAmount).toFixed(4)} ${order.baseMint}`
                                    : '--'}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400">결제 금액:</span>
                                <span className="text-white ml-2">
                                  {filledQuoteAmount > 0
                                    ? `$${filledQuoteAmount.toFixed(2)}`
                                    : parseFloat(order.filledAmount) > 0
                                    ? '계산 중...'
                                    : '--'}
                                </span>
                              </div>
                            </>
                          ) : isMarketSell ? (
                            <>
                              <div>
                                <span className="text-gray-400">체결 수량:</span>
                                <span className="text-white ml-2">
                                  {parseFloat(order.filledAmount) > 0
                                    ? `${parseFloat(order.filledAmount).toFixed(4)} ${order.baseMint}`
                                    : '--'}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400">총액:</span>
                                <span className="text-white ml-2">
                                  {filledQuoteAmount > 0
                                    ? `$${filledQuoteAmount.toFixed(2)}`
                                    : parseFloat(order.filledAmount) > 0
                                    ? '계산 중...'
                                    : '--'}
                                </span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <span className="text-gray-400">가격:</span>
                                <span className="text-white ml-2">
                                  {order.price ? `$${parseFloat(order.price).toFixed(2)}` : '시장가'}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400">총액:</span>
                                <span className="text-white ml-2">
                                  {filledQuoteAmount > 0
                                    ? `$${filledQuoteAmount.toFixed(2)}`
                                    : totalFromPrice > 0
                                    ? `$${totalFromPrice.toFixed(2)}`
                                    : '--'}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    // 미체결 탭: 수량, 체결, 체결률 표시
                    <>
                      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                        <div>
                          <span className="text-gray-400">가격:</span>
                          <span className="text-white ml-2">
                            {order.price ? `$${parseFloat(order.price).toFixed(2)}` : '시장가'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">수량:</span>
                          <span className="text-white ml-2">
                            {order.orderSide === 'market' && order.orderType === 'buy' && parseFloat(order.amount) === 0
                              ? '매칭 대기 중'
                              : `${parseFloat(order.amount).toFixed(4)} ${order.baseMint}`}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">체결:</span>
                          <span className="text-white ml-2">
                            {parseFloat(order.filledAmount).toFixed(4)} {order.baseMint}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">체결률:</span>
                          <span className="text-white ml-2">
                            {order.orderSide === 'market' && order.orderType === 'buy' && parseFloat(order.amount) === 0
                              ? '계산 중'
                              : `${filledPercent.toFixed(1)}%`}
                          </span>
                        </div>
                      </div>

                      {/* 체결 진행률 바 */}
                      {['pending', 'partial'].includes(order.status) && (
                        <div className="mb-2">
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                isBuy ? 'bg-red-400' : 'bg-blue-400'
                              }`}
                              style={{ width: `${Math.min(filledPercent, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* 취소 버튼 */}
                  {order.status === 'pending' || order.status === 'partial' ? (
                    <button
                      onClick={() => handleCancel(order.id)}
                      disabled={cancelingId === order.id}
                      className="w-full mt-2 py-1.5 px-3 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancelingId === order.id ? '취소 중...' : '주문 취소'}
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

