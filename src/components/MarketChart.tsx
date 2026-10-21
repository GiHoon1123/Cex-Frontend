'use client';
import {useEffect,useRef,useState} from 'react';
import {CandlestickSeries,ColorType,createChart,UTCTimestamp,ISeriesApi} from 'lightweight-charts';
import {PLATFORM_ORIGIN} from '@/lib/platform';
import {useMarket} from '@/contexts/MarketContext';
interface Candle {time:number;open:string;high:string;low:string;close:string;volume:string}

/** 외부 위젯 대신 설치한 차트 라이브러리에 자체 체결 봉을 제공한다.
 * 숫자 변환은 캔버스 좌표용이며 주문 금액의 권위로 사용하지 않는다. */
export default function MarketChart() {
  const container=useRef<HTMLDivElement>(null);
  const {view}=useMarket();
  const latestTrade=view?.trades[0]?.id;
  const [empty,setEmpty]=useState(true),[error,setError]=useState(false);
  const previous=useRef<Candle[]>([]);
  const series=useRef<ISeriesApi<'Candlestick'>|null>(null);
  useEffect(()=> {
    if(!container.current)return;
    const chart=createChart(container.current,{autoSize:true,layout:{background:{type:ColorType.Solid,color:'#111827'},textColor:'#9ca3af',attributionLogo:true},grid:{vertLines:{color:'#1f2937'},horzLines:{color:'#1f2937'}},timeScale:{timeVisible:true}});
    series.current=chart.addSeries(CandlestickSeries,{upColor:'#10b981',downColor:'#ef4444',borderVisible:false,wickUpColor:'#10b981',wickDownColor:'#ef4444'});
    return()=>{series.current=null;chart.remove();};
  },[]);
  useEffect(()=> {
    const abort=new AbortController();
    // 중간 소켓 프레임이 합쳐져도 봉은 영속 체결에서 다시 읽는다. 같은 응답을
    // 받은 뒤 로컬 체결을 또 합산해 거래량을 중복 계산하지 않는다.
    fetch(`${PLATFORM_ORIGIN}/api/market/BTC/USDT/candles`,{signal:abort.signal})
      .then(response=>{if(!response.ok)throw new Error();return response.json() as Promise<Candle[]>;})
      .then(candles=> {
        if(abort.signal.aborted)return;
        const point=(c:Candle)=>({time:c.time as UTCTimestamp,open:Number(c.open),high:Number(c.high),low:Number(c.low),close:Number(c.close)});
        const old=previous.current;
        // 과거 봉이 같으면 마지막 봉과 새 봉만 갱신한다. 조회 범위가 이동하거나
        // 과거 내용이 바뀐 경우에만 전체 데이터로 다시 동기화한다.
        const unchanged=old.length>0 && candles.length>=old.length && old.slice(0,-1).every((c,i)=>JSON.stringify(c)===JSON.stringify(candles[i]));
        if(unchanged) candles.slice(old.length-1).forEach(c=>series.current?.update(point(c)));
        else series.current?.setData(candles.map(point));
        previous.current=candles;
        setEmpty(candles.length===0);setError(false);
      }).catch(()=>{if(!abort.signal.aborted)setError(true);});
    return()=>abort.abort();
  },[latestTrade]);
  return <section className="h-full min-h-64 relative bg-gray-900 rounded-lg border border-gray-700 p-2">
    <p className="text-xs text-gray-400 mb-1">BTC/USDT · 자체 체결 1분 봉 · 최근 5천 체결 범위</p>
    <div ref={container} className="h-[calc(100%-24px)] min-h-56" aria-label="BTC 자체 체결 차트" />
    {(empty||error)&&<p className="absolute top-1/2 left-0 right-0 text-center text-gray-400 text-sm pointer-events-none">{error?'차트 데이터를 불러오지 못했습니다.':'체결이 발생하면 차트가 표시됩니다.'}</p>}
  </section>;
}
