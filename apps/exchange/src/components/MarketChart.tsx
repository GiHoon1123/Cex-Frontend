'use client';
import {useEffect,useRef,useState} from 'react';
import {CandlestickSeries,ColorType,createChart,UTCTimestamp,ISeriesApi} from 'lightweight-charts';
import {useMarket} from '@/contexts/MarketContext';
interface Candle {time:number;open:string;high:string;low:string;close:string;volume:string}
type CandleInterval='1m'|'5m'|'15m'|'1h'|'4h'|'1d'|'1w'|'1M';
interface ReferenceCandles {source:'BINANCE';market:string;interval:CandleInterval;fetchedAt:string;candles:Candle[]}
const intervals:[CandleInterval,string][]=[['1m','1분'],['5m','5분'],['15m','15분'],['1h','1시간'],['4h','4시간'],['1d','1일'],['1w','1주'],['1M','1개월']];

/** 외부 위젯 대신 플랫폼이 검증한 Binance 기준 봉을 그린다.
 * 기준 차트는 자체 호가·체결 가격의 권위가 아니며, 숫자 변환은 캔버스 좌표에만 사용한다. */
export default function MarketChart() {
  const container=useRef<HTMLDivElement>(null);
  const {base}=useMarket();
  const [candleInterval,setCandleInterval]=useState<CandleInterval>('1m');
  const [status,setStatus]=useState({key:'',fetchedAt:'',empty:true,error:false});
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
    // 거래쌍이나 봉 간격을 바꾼 직후에는 이전 시장의 캔들을 지운다. 새 응답이
    // 오기 전까지 과거 선택의 차트를 현재 선택처럼 보여주지 않는다.
    previous.current=[];series.current?.setData([]);
    const selection=`${base}:${candleInterval}`;
    const query=new URLSearchParams({interval:candleInterval});
    const load=()=>fetch(`/api/platform/api/market/${base}/USDT/reference-candles?${query}`,{signal:abort.signal,credentials:'same-origin'})
      .then(response=>{if(!response.ok)throw new Error();return response.json() as Promise<ReferenceCandles>;})
      .then(reference=> {
        if(abort.signal.aborted)return;
        if(reference.source!=='BINANCE'||reference.market!==`${base}/USDT`||reference.interval!==candleInterval||!Array.isArray(reference.candles))throw new Error();
        const candles=reference.candles;
        const point=(c:Candle)=>({time:c.time as UTCTimestamp,open:Number(c.open),high:Number(c.high),low:Number(c.low),close:Number(c.close)});
        const old=previous.current;
        // 과거 봉이 같으면 마지막 봉과 새 봉만 갱신한다. 조회 범위가 이동하거나
        // 과거 내용이 바뀐 경우에만 전체 데이터로 다시 동기화한다.
        const unchanged=old.length>0 && candles.length>=old.length && old.slice(0,-1).every((c,i)=>JSON.stringify(c)===JSON.stringify(candles[i]));
        if(unchanged) candles.slice(old.length-1).forEach(c=>series.current?.update(point(c)));
        else series.current?.setData(candles.map(point));
        previous.current=candles;
        setStatus({key:selection,fetchedAt:reference.fetchedAt,empty:candles.length===0,error:false});
      }).catch(()=>{if(!abort.signal.aborted)setStatus({key:selection,fetchedAt:'',empty:true,error:true});});
    void load();const timer=setInterval(load,15000);
    return()=>{clearInterval(timer);abort.abort();};
  },[base,candleInterval]);
  const selection=`${base}:${candleInterval}`,current=status.key===selection;
  return <section className="h-full min-h-64 relative bg-[#0b0e11] border border-[#2b3139] p-2">
    <div className="mb-1 min-w-0">
      <p className="truncate text-xs text-gray-400">{base}/USDT · Binance 외부 기준 시세 · 최대 500봉{current&&status.fetchedAt?` · ${new Date(status.fetchedAt).toLocaleTimeString('ko-KR')} 갱신`:''}</p>
      <div className="mt-1 flex flex-wrap items-center gap-1 text-xs" aria-label="차트 봉 간격">
        <span className="mr-1 shrink-0 text-gray-500">기간</span>
        {intervals.map(([value,label])=><button key={value} type="button" onClick={()=>setCandleInterval(value)} aria-pressed={candleInterval===value} className={`shrink-0 rounded px-2 py-1 ${candleInterval===value?'bg-[#2b3139] text-[#f0b90b]':'text-gray-400 hover:bg-[#1e2329] hover:text-white'}`}>{label}</button>)}
      </div>
    </div>
    <div ref={container} className="h-[calc(100%-78px)] min-h-44 sm:h-[calc(100%-52px)] sm:min-h-48" aria-label={`${base} Binance 기준 차트`} />
    {(!current||status.empty||status.error)&&<p className="absolute top-1/2 left-0 right-0 text-center text-gray-400 text-sm pointer-events-none">{!current?'기준 시세를 불러오는 중입니다.':status.error?'Binance 기준 시세를 불러오지 못했습니다.':'표시할 외부 기준 봉이 없습니다.'}</p>}
  </section>;
}
