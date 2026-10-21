'use client';
import {useEffect,useState} from 'react';
import Decimal from 'decimal.js';
import {apiClient,ApiError,Balance,CreateOrderRequest} from '@/lib/api';
import {useMarket} from '@/contexts/MarketContext';

interface Intent {key:string;request:CreateOrderRequest}
/** 주문 의도는 전송 전에 저장하고, 통신 실패 뒤에는 같은 키·본문으로만 확인한다.
 * 접수·체결·플랫폼 반영은 서로 다른 상태다. HTTP 접수를 체결 완료로 표시하지 않는다. */
export default function OrderPanel() {
  const [side,setSide]=useState<'buy'|'sell'>('buy');
  const [kind,setKind]=useState<'limit'|'market'>('limit');
  const [price,setPrice]=useState(''),[amount,setAmount]=useState(''),[budget,setBudget]=useState('');
  const [balances,setBalances]=useState<Balance[]>([]),[owner,setOwner]=useState<number|null>(null);
  const [intent,setIntent]=useState<Intent|null>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
  const {view}=useMarket();const lastPrice=view?.trades[0]?.price;
  useEffect(()=> {
    let stopped=false;
    const load=async()=> {
      if(!apiClient.isAuthenticated()){if(!stopped){setOwner(null);setBalances([]);}return;}
      try {
        const [user,balances]=await Promise.all([apiClient.getMe(),apiClient.getBalances()]);
        if(stopped)return;
        const saved=sessionStorage.getItem(`pending-order:${user.id}`);
        if(saved){setIntent(JSON.parse(saved));setMessage('확인이 필요한 주문이 있습니다. 같은 요청으로 접수 상태를 확인하세요.');}
        setOwner(user.id);setBalances(balances);
      } catch {if(!stopped){setOwner(null);setMessage('계정·잔액 또는 저장된 주문을 확인하지 못했습니다.');}}
    };
    void load();const timer=setInterval(load,5000);
    return()=>{stopped=true;clearInterval(timer);};
  },[]);
  const balance=(asset:string)=>balances.find(b=>b.mintAddress===asset)?.available??'0';
  const percent=(value:number)=> {
    try {
      // 화면의 비율 입력도 이진 부동소수점 대신 십진 연산을 사용한다. 내림으로
      // 사용 가능 잔액을 넘지 않는 입력 후보를 만들고 서버가 다시 검증한다.
      const available=new Decimal(balance(side==='buy'?'USDT':'BTC')).mul(value).div(100);
      if(side==='sell')setAmount(available.toDecimalPlaces(8,Decimal.ROUND_DOWN).toFixed());
      else if(kind==='market')setBudget(available.toDecimalPlaces(2,Decimal.ROUND_DOWN).toFixed());
      else if(new Decimal(price||'0').gt(0))setAmount(available.div(price).toDecimalPlaces(8,Decimal.ROUND_DOWN).toFixed());
    } catch {setMessage('먼저 유효한 가격을 입력해주세요.');}
  };
  const send=async(existing?:Intent)=> {
    if(owner===null){setMessage('로그인이 필요합니다.');return;}
    setBusy(true);setMessage('');
    try {
      const request:CreateOrderRequest={orderType:side,orderSide:kind,baseMint:'BTC',quoteMint:'USDT'};
      if(kind==='limit'){request.price=price;request.amount=amount;}
      else if(side==='buy')request.quoteAmount=budget;
      else request.amount=amount;
      const next=existing??{key:crypto.randomUUID(),request};
      if(!existing) {
        for(const value of [next.request.price,next.request.amount,next.request.quoteAmount].filter(v=>v!==undefined)) {
          const decimal=new Decimal(value!);
          if(!decimal.isFinite()||decimal.lte(0)||decimal.decimalPlaces()>9)throw new Error('가격·수량은 양수이며 소수점 9자리 이하여야 합니다.');
        }
        sessionStorage.setItem(`pending-order:${owner}`,JSON.stringify(next));setIntent(next);
      }
      const result=await apiClient.createOrder(next.request,next.key);
      if(result.state==='uncertain') {
        setMessage(`주문 ${result.orderId}: 플랫폼 저장 완료, 엔진 접수 결과 확인 필요. 새 주문으로 다시 보내지 마세요.`);
      } else {
        sessionStorage.removeItem(`pending-order:${owner}`);setIntent(null);
        setMessage(result.state==='accepted'?`주문 ${result.order.id} 접수됨. 체결 여부는 거래내역에서 확인하세요.`:`기존 주문 ${result.order.id} 조회됨. 현재 상태: ${result.order.status}`);
        void apiClient.getBalances().then(setBalances).catch(()=>setMessage(`주문 ${result.order.id} 접수 조회됨 · 잔액 갱신 실패`));
      }
    } catch(error) {
      // 입력·인증의 명시적인 거부만 새 입력을 허용한다. 서버 오류나 통신 유실은
      // 영속 접수 뒤에 생겼을 수 있어 원래 키를 보존한다.
      if(error instanceof ApiError && [400,401,403,422].includes(error.status)) {
        sessionStorage.removeItem(`pending-order:${owner}`);setIntent(null);
      }
      setMessage(error instanceof Error?error.message:'주문 응답을 확인하지 못했습니다.');
    } finally {setBusy(false);}
  };
  const disabled=busy||intent!==null;
  let total='';try{if(price&&amount)total=new Decimal(price).mul(amount).toFixed();}catch{}
  return <section className="bg-gray-800 rounded-lg border border-gray-700 p-5 h-full overflow-y-auto" aria-label="주문 입력">
    <div className="flex gap-2 mb-4">{(['buy','sell'] as const).map(value=><button key={value} disabled={disabled} onClick={()=>setSide(value)} className={`flex-1 py-2 rounded ${side===value?(value==='buy'?'bg-emerald-600':'bg-red-600'):'bg-gray-700'}`}>{value==='buy'?'매수':'매도'}</button>)}</div>
    <div className="flex gap-4 text-sm mb-4">{(['limit','market'] as const).map(value=><label key={value}><input type="radio" name="order-kind" checked={kind===value} disabled={disabled} onChange={()=>setKind(value)} /> {value==='limit'?'지정가':'시장가'}</label>)}</div>
    <p className="text-xs text-gray-400 mb-3">사용 가능 {balance(side==='buy'?'USDT':'BTC')} {side==='buy'?'USDT':'BTC'}</p>
    {kind==='limit'&&<label className="block text-sm mb-3">가격 (USDT)<div className="flex mt-1 gap-2"><input aria-label="가격 (USDT)" type="number" min="0" step="0.01" value={price} disabled={disabled} onChange={e=>setPrice(e.target.value)} className="w-full bg-gray-900 rounded p-2" /><button disabled={disabled||!lastPrice} onClick={()=>lastPrice&&setPrice(lastPrice)} className="text-xs shrink-0">최근 체결가</button></div></label>}
    {kind==='market'&&side==='buy'?<label className="block text-sm mb-3">매수 금액 (USDT)<input aria-label="매수 금액 (USDT)" type="number" min="0" step="0.01" value={budget} disabled={disabled} onChange={e=>setBudget(e.target.value)} className="block w-full bg-gray-900 rounded p-2 mt-1" /></label>:<label className="block text-sm mb-3">수량 (BTC)<input aria-label="수량 (BTC)" type="number" min="0" step="0.000000001" value={amount} disabled={disabled} onChange={e=>setAmount(e.target.value)} className="block w-full bg-gray-900 rounded p-2 mt-1" /></label>}
    <div className="flex gap-2 mb-3">{[25,50,75,100].map(p=><button key={p} disabled={disabled} onClick={()=>percent(p)} className="flex-1 bg-gray-700 rounded py-1 text-xs">{p}%</button>)}</div>
    {kind==='limit'&&total&&<p className="text-xs text-gray-400 mb-3">주문 금액 {total} USDT</p>}
    {message&&<p role="status" className="text-sm text-amber-300 my-3 break-all">{message}</p>}
    {intent?<button disabled={busy} onClick={()=>void send(intent)} className="w-full bg-amber-700 rounded py-3">{busy?'확인 중…':'같은 주문 접수 확인'}</button>:<button disabled={busy||owner===null} onClick={()=>void send()} className={`w-full rounded py-3 disabled:opacity-50 ${side==='buy'?'bg-emerald-600':'bg-red-600'}`}>{owner===null?'로그인 후 주문':busy?'접수 중…':side==='buy'?'BTC 매수':'BTC 매도'}</button>}
  </section>;
}
