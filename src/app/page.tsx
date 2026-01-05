'use client';

import { useState } from 'react';
import SolanaChart from '@/components/SolanaChart';
import OrderPanel from '@/components/OrderPanel';
import OrderBook from '@/components/OrderBook';
import TradeHistory from '@/components/TradeHistory';
import AssetList from '@/components/AssetList';

type TabType = 'chart' | 'orderbook' | 'order';

export default function Home() {
  const [selectedMarket] = useState('SOL/USDT');
  const [activeTab, setActiveTab] = useState<TabType>('chart');
  const [showAssetList, setShowAssetList] = useState(false);

  return (
    <main className="min-h-screen bg-gray-900">
      {/* 데스크톱 레이아웃 (원래대로 유지) */}
      <div className="hidden lg:flex h-[calc(100vh-4rem)] justify-center items-start px-8 py-4 overflow-hidden">
        <div className="scale-[0.8] origin-top w-full max-w-[1920px] h-[125%] flex">
          {/* 좌측: 자산 리스트 */}
          <AssetList />

          {/* 중앙: 차트 + 주문 패널 */}
          <div className="flex-1 flex flex-col p-6 gap-6 overflow-hidden">
            {/* 차트 영역 */}
            <div className="flex-[1.5] min-h-0">
              <div className="mb-3">
                <h2 className="text-lg font-semibold text-white">{selectedMarket}</h2>
              </div>
              <div className="h-full">
                <SolanaChart />
              </div>
            </div>

            {/* 주문 패널 */}
            <div className="flex-[1] min-h-0 flex-shrink-0 overflow-hidden">
              <OrderPanel />
            </div>
          </div>

          {/* 우측: 호가창 + 체결 내역 */}
          <div className="w-72 flex-shrink-0 p-6 flex flex-col gap-6 overflow-hidden">
            <div className="flex-1 min-h-0">
              <OrderBook />
            </div>
            <div className="h-56">
              <TradeHistory />
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 레이아웃 (업비트 스타일) */}
      <div className="lg:hidden flex flex-col h-[calc(100vh-4rem)]">
        {/* 상단: 마켓 정보 + 자산 버튼 */}
        <div className="flex-shrink-0 bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">{selectedMarket}</h2>
          <button
            onClick={() => setShowAssetList(!showAssetList)}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
          >
            자산
          </button>
        </div>

        {/* 자산 리스트 드로어 */}
        {showAssetList && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowAssetList(false)}>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] max-w-[90vw] max-h-[85vh] bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="px-6 py-5 border-b border-gray-700 flex items-center justify-center bg-gray-800 flex-shrink-0 relative">
                <h3 className="text-lg font-bold text-white">자산 내역</h3>
                <button
                  onClick={() => setShowAssetList(false)}
                  className="absolute right-4 text-gray-400 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700 transition-colors"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <AssetList hideHeader={true} />
              </div>
            </div>
          </div>
        )}

        {/* 탭 네비게이션 */}
        <div className="flex-shrink-0 flex border-b border-gray-700 bg-gray-800">
          <button
            onClick={() => setActiveTab('chart')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'chart'
                ? 'bg-gray-900 text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            차트
          </button>
          <button
            onClick={() => setActiveTab('orderbook')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'orderbook'
                ? 'bg-gray-900 text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            호가
          </button>
          <button
            onClick={() => setActiveTab('order')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'order'
                ? 'bg-gray-900 text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            주문
          </button>
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {/* 차트 탭: 차트만 보임 */}
          {activeTab === 'chart' && (
            <div className="h-full p-2">
              <SolanaChart />
            </div>
          )}

          {/* 호가 탭: 호가만 보임 */}
          {activeTab === 'orderbook' && (
            <div className="h-full p-2">
              <OrderBook />
            </div>
          )}

          {/* 주문 탭: 왼쪽 체결내역 + 오른쪽 주문 패널 */}
          {activeTab === 'order' && (
            <div className="h-full flex gap-2 p-2">
              {/* 왼쪽: 체결 내역 */}
              <div className="flex-1 min-w-0">
                <TradeHistory />
              </div>
              {/* 오른쪽: 주문 패널 */}
              <div className="flex-1 min-w-0">
                <OrderPanel />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

