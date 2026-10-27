'use client';
import {useEffect,useState} from 'react';
import {apiClient,AssetPosition,Balance} from '@/lib/api';
import {useMarket} from '@/contexts/MarketContext';

/** 잔액·손익은 플랫폼 응답을 사용한다. 외부 시세나 이전 잔액으로 조회 실패를 가리지 않는다. */
export default function AssetList({hideHeader=false}:{hideHeader?:boolean}) {
  const [balances,setBalances]=useState<Balance[]>([]),[positions,setPositions]=useState<AssetPosition[]>([]);
  const [error,setError]=useState('');const [loggedIn,setLoggedIn]=useState(false);
  const {view}=useMarket();
  useEffect(()=> {
    let stopped=false;
    const load=async()=> {
      const authenticated=apiClient.isAuthenticated();setLoggedIn(authenticated);
      if(!authenticated){setBalances([]);setPositions([]);return;}
      try {
        const [balances,positions]=await Promise.all([apiClient.getBalances(),apiClient.getPositions()]);
        if(!stopped){setBalances(balances);setPositions(positions);setError('');}
      } catch {if(!stopped)setError('자산 조회 실패 · 마지막 조회 상태');}
    };
    void load();const timer=setInterval(load,5000);
    return()=>{stopped=true;clearInterval(timer);};
  },[]);
  return <section className="bg-[#181a20] border border-[#2b3139] p-4 w-full lg:w-64 shrink-0 overflow-y-auto">
    {!hideHeader&&<h2 className="font-semibold mb-4">자산 내역</h2>}
    {!loggedIn?<p className="text-sm text-gray-400">로그인 후 확인할 수 있습니다.</p>:<>
      {error&&<p role="alert" className="text-xs text-red-400 mb-2">{error}</p>}
      {balances.filter(b=>['BTC','ETH','USDT'].includes(b.mintAddress)).map(balance=> {
        const position=positions.find(p=>p.mint===balance.mintAddress);
        return <div key={balance.mintAddress} className="border-b border-[#2b3139] py-3 text-xs">
          <h3 className="font-semibold text-base mb-2">{balance.mintAddress==='BTC'?'₿ BTC':balance.mintAddress==='ETH'?'Ξ ETH':'USDT'}</h3>
          <p>사용 가능 <span className="float-right font-mono">{balance.available}</span></p>
          <p className="mt-1 text-gray-400">주문 예약 <span className="float-right font-mono">{balance.locked}</span></p>
          {position?.averageEntryPrice&&<p className="mt-2">평균 매수가 {position.averageEntryPrice} USDT</p>}
          {position?.unrealizedPnl&&<p className="mt-1">미실현 손익 {position.unrealizedPnl} USDT</p>}
        </div>;
      })}
      {!balances.length&&<p className="text-sm text-gray-400">보유 자산이 없습니다.</p>}
      {view?.trades[0]&&<p className="mt-3 text-xs text-gray-400">최근 자체 체결 {view.trades[0].price} USDT</p>}
    </>}
  </section>;
}
