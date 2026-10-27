'use client';
import {useEffect,useRef,useState} from 'react';
import {CandlestickSeries,ColorType,createChart,UTCTimestamp,ISeriesApi} from 'lightweight-charts';
import {useMarket} from '@/contexts/MarketContext';
interface Candle {time:number;open:string;high:string;low:string;close:string;volume:string}
interface ReferenceCandles {source:'BINANCE';market:string;interval:'1m';fetchedAt:string;candles:Candle[]}

/** 외부 위젯 대신 플랫폼이 검증한 Binance 기준 봉을 그린다.
 * 기준 차트는 자체 호가·체결 가격의 권위가 아니며, 숫자 변환은 캔버스 좌표에만 사용한다. */
export default function MarketChart() {
  const container=useRef<HTMLDivElement>(null);
  const {base}=useMarket();
  const [empty,setEmpty]=useState(true),[error,setError]=useState(false);
  const [fetchedAt,setFetchedAt]=useState<string|null>(null);
  const previous=useRef<Candle[]>([]);
  const series=useRef<ISeriesApi<'Candlestick'>|null>(null);
  useEffect(()=> {
    if(!container.current)return;
    const chart=createChart(container.current,{autoSize:true,layout:{background:{type:ColorType.Solid,color:'#0b0e11'},textColor:'#848e9c',attributionLogo:true},grid:{vertLines:{color:'#1e2329'},horzLines:{color:'#1e2329'}},timeScale:{timeVisible:true,borderColor:'#2b3139'},rightPriceScale:{borderColor:'#2b3139'}});
    series.current=chart.addSeries(CandlestickSeries,{upColor:'#0ecb81',downColor:'#f6465d',borderVisible:false,wickUpColor:'#0ecb81',wickDownColor:'#f6465d'});
    return()=>{series.current=null;chart.remove();};
  },[]);
  useEffect(()=> {
    const abort=new AbortController();
    const load=()=>fetch(`/api/platform/api/market/${base}/USDT/reference-candles`,{signal:abort.signal,credentials:'same-origin'})
      .then(response=>{if(!response.ok)throw new Error();return response.json() as Promise<ReferenceCandles>;})
      .then(reference=> {
        if(abort.signal.aborted)return;
        if(reference.source!=='BINANCE'||reference.market!==`${base}/USDT`||reference.interval!=='1m'||!Array.isArray(reference.candles))throw new Error();
        const candles=reference.candles;
        const point=(c:Candle)=>({time:c.time as UTCTimestamp,open:Number(c.open),high:Number(c.high),low:Number(c.low),close:Number(c.close)});
        const old=previous.current;
        // 과거 봉이 같으면 마지막 봉과 새 봉만 갱신한다. 조회 범위가 이동하거나
        // 과거 내용이 바뀐 경우에만 전체 데이터로 다시 동기화한다.
        const unchanged=old.length>0 && candles.length>=old.length && old.slice(0,-1).every((c,i)=>JSON.stringify(c)===JSON.stringify(candles[i]));
        if(unchanged) candles.slice(old.length-1).forEach(c=>series.current?.update(point(c)));
        else series.current?.setData(candles.map(point));
        previous.current=candles;
        setFetchedAt(reference.fetchedAt);setEmpty(candles.length===0);setError(false);
      }).catch(()=>{if(!abort.signal.aborted)setError(true);});
    void load();const timer=setInterval(load,15000);
    return()=>{clearInterval(timer);abort.abort();};
  },[base]);
  return <section className="h-full min-h-64 relative bg-[#0b0e11] border border-[#2b3139] p-2">
    <p className="text-xs text-gray-400 mb-1">{base}/USDT · Binance 외부 기준 시세 · 1분 봉{fetchedAt?` · ${new Date(fetchedAt).toLocaleTimeString('ko-KR')} 갱신`:''}</p>
    <div ref={container} className="h-[calc(100%-24px)] min-h-56" aria-label={`${base} Binance 기준 차트`} />
    {(empty||error)&&<p className="absolute top-1/2 left-0 right-0 text-center text-gray-400 text-sm pointer-events-none">{error?'Binance 기준 시세를 불러오지 못했습니다.':'표시할 외부 기준 봉이 없습니다.'}</p>}
  </section>;
}
