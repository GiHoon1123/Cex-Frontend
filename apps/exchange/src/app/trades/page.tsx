'use client';

import {useEffect,useState,useSyncExternalStore} from 'react';
import {useRouter} from 'next/navigation';
import {apiClient,SessionState,Trade} from '@/lib/api';
import MyOrders from '@/components/MyOrders';

/** 자체 엔진에서 확정돼 플랫폼 DB에 반영된 본인 체결만 조회한다. */
export default function TradesPage(){
  const router=useRouter(),authenticated=useSyncExternalStore(SessionState.subscribe,SessionState.hasSession,()=>false);
  const [asset,setAsset]=useState<'BTC'|'ETH'>('BTC'),[rows,setRows]=useState<Trade[]>([]),[error,setError]=useState('');
  useEffect(()=>{if(!apiClient.isAuthenticated())router.push('/');},[router]);
  useEffect(()=>{if(!authenticated)return;let active=true;apiClient.getMyTrades(asset).then(value=>{if(active){setRows(value);setError('');}}).catch(problem=>{if(active)setError(problem instanceof Error?problem.message:'체결 내역을 조회하지 못했습니다');});return()=>{active=false;};},[asset,authenticated]);
  if(!authenticated)return null;
  return <main className="mx-auto max-w-5xl p-4 md:p-8"><div className="mb-5 flex items-center justify-between"><div><h1 className="text-2xl font-semibold">거래내역</h1><p className="text-sm text-gray-400">외부 거래소가 아닌 자체 엔진의 확정 체결입니다.</p></div><select aria-label="거래내역 자산" value={asset} onChange={event=>setAsset(event.target.value as 'BTC'|'ETH')} className="rounded border border-gray-600 bg-gray-800 p-2"><option>BTC</option><option>ETH</option></select></div><section className="mb-5 rounded border border-gray-700 bg-[#181a20] p-4"><h2 className="mb-3 font-semibold">미체결 주문</h2><MyOrders filterStatus={['pending','partial']}/></section>{error&&<p role="alert" className="mb-4 text-red-400">{error}</p>}<div className="overflow-x-auto rounded border border-gray-700"><table className="w-full text-sm"><thead className="bg-[#181a20] text-gray-400"><tr><th className="p-3 text-left">시각</th><th>시장</th><th>가격</th><th>수량</th></tr></thead><tbody>{rows.map(row=><tr key={row.id} className="border-t border-gray-800"><td className="p-3">{new Date(row.createdAt).toLocaleString('ko-KR')}</td><td className="text-center">{row.baseMint}/{row.quoteMint}</td><td className="text-center font-mono">{row.price}</td><td className="text-center font-mono">{row.amount}</td></tr>)}</tbody></table>{!rows.length&&<p className="p-6 text-center text-gray-500">체결 내역이 없습니다.</p>}</div></main>;
}
