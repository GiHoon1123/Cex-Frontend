'use client';
import {useMarket} from '@/contexts/MarketContext';
/** 최근 체결은 플랫폼이 보관한 자체 체결 이력이다. 매수·매도 표시는 유입 주문의 방향이다. */
export default function TradeHistory() {
  const {view}=useMarket();
  return <section className="bg-gray-800 rounded-lg border border-gray-700 p-4 h-full overflow-y-auto" aria-label="최근 자체 체결">
    <h2 className="font-semibold mb-3">최근 체결</h2>
    {!view?.trades.length?<p className="text-gray-400 text-sm">아직 체결이 없습니다.</p>:view.trades.slice(0,20).map(trade=>
      <div key={trade.id} className="grid grid-cols-3 gap-2 text-xs py-1 font-mono">
        <span className={trade.side==='buy'?'text-emerald-400':'text-red-400'}>{Number(trade.price).toLocaleString('en-US',{minimumFractionDigits:2})}</span>
        <span className="text-right">{trade.amount}</span><span className="text-right text-gray-400">{new Date(trade.timestamp).toLocaleTimeString('ko-KR',{hour12:false})}</span>
      </div>)}
  </section>;
}
