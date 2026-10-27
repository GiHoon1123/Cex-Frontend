'use client';
import {useMarket} from '@/contexts/MarketContext';

/** 자체 체결 코어에서 확정한 가격별 잔량만 표시한다. 빈 호가를 외부 가격으로 채우지 않는다. */
export default function OrderBook() {
  const {view,connected,base}=useMarket();
  const last=view?.trades[0];
  const rows=(levels:[string,string][],side:'buy'|'sell')=>levels.map(([price,quantity])=>
    <div key={price} className="grid grid-cols-2 gap-3 py-1 font-mono text-xs"><span className={side==='buy'?'text-emerald-400':'text-red-400'}>{Number(price).toLocaleString('en-US',{minimumFractionDigits:2})}</span><span className="text-right">{quantity}</span></div>);
  return <section className="bg-gray-800 rounded-lg border border-gray-700 p-4 h-full overflow-y-auto" aria-label="자체 호가창">
    <h2 className="font-semibold">호가창 · {base}/USDT</h2>
    <p className="text-xs text-gray-400 my-2">{connected?'플랫폼 연결됨':'연결 대기 · 마지막 수신 상태'}</p>
    <div className="grid grid-cols-2 text-xs text-gray-400 border-b border-gray-700 py-2"><span>가격 (USDT)</span><span className="text-right">수량 ({base})</span></div>
    {!view?<p className="py-8 text-sm text-gray-400">호가 데이터 대기 중</p>:<>
      {rows([...view.book.asks].reverse(),'sell')}
      {!view.book.asks.length&&<p className="text-xs text-gray-400 py-3">매도 호가 없음</p>}
      <div className="border-y border-gray-700 py-3 font-mono">{last?Number(last.price).toLocaleString('en-US',{minimumFractionDigits:2}):'체결 없음'}</div>
      {rows(view.book.bids,'buy')}
      {!view.book.bids.length&&<p className="text-xs text-gray-400 py-3">매수 호가 없음</p>}
    </>}
  </section>;
}
