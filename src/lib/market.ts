export interface PublicTrade {id:string;price:string;amount:string;side:'buy'|'sell';timestamp:string}
export interface MarketView {
  book:{engine_id:string;sequence:string;previous_sequence:string;base_mint:string;quote_mint:string;timestamp:string;bids:[string,string][];asks:[string,string][]};
  trades:PublicTrade[];
}
/** 한 프레임에 전체 호가가 있으므로 중간 순번이 건너뛰어도 최신 전체 상태로
 * 교체한다. 같은 엔진의 늦게 도착한 프레임이 화면을 되돌리지 못하게 한다. */
export function acceptSnapshot(current:MarketView|null,next:MarketView):MarketView {
  const positive=(value:unknown)=>typeof value==='string' && /^\d+(?:\.\d{1,9})?$/.test(value) && /[1-9]/.test(value);
  const levels=(value:unknown)=>Array.isArray(value) && value.length<=20 && value.every(level=>Array.isArray(level)&&level.length===2&&level.every(positive));
  if(!next?.book || next.book.base_mint!=='BTC'||next.book.quote_mint!=='USDT'
      || typeof next.book.engine_id!=='string' || !/^[1-9]\d*$/.test(next.book.sequence)
      || !/^\d+$/.test(next.book.previous_sequence) || !levels(next.book.bids) || !levels(next.book.asks)
      || !Array.isArray(next.trades) || next.trades.length>100
      || next.trades.some(trade=>typeof trade.id!=='string' || !positive(trade.price) || !positive(trade.amount) || !['buy','sell'].includes(trade.side) || !Number.isFinite(Date.parse(trade.timestamp)))) {
    throw new Error('잘못된 시장 스냅샷입니다.');
  }
  if(current && current.book.engine_id===next.book.engine_id && BigInt(next.book.sequence)<=BigInt(current.book.sequence)) return current;
  return next;
}
