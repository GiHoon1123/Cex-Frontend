'use client';

import {FormEvent,useEffect,useState} from 'react';
import {Brand,Section,StateBadge} from '@cex/ui';
import {credentialJson,decodeRequestOptions} from '@cex/ui/webauthn';
import {adminApi,EthereumPayoutReview,OperationsStatus,User} from '@/lib/api';

export default function AdminPage(){
  const [user,setUser]=useState<User|null>(null),[status,setStatus]=useState<OperationsStatus|null>(null);
  const [approvals,setApprovals]=useState<Record<string,unknown>[]>([]),[signals,setSignals]=useState<Record<string,unknown>[]>([]),[audit,setAudit]=useState<Record<string,unknown>[]>([]);
  const [ethereumReview,setEthereumReview]=useState<EthereumPayoutReview|null>(null);
  const [error,setError]=useState(''),[loading,setLoading]=useState(true);
  async function load(){setLoading(true);setError('');try{const current=await adminApi.me();setUser(current);const [health,requests,market,auditRows]=await Promise.all([adminApi.status(),adminApi.approvals(),adminApi.signals(),adminApi.audit()]);setStatus(health);setApprovals(requests);setSignals(market);setAudit(auditRows);}catch(problem){setUser(null);setError(problem instanceof Error?problem.message:'조회에 실패했습니다');}finally{setLoading(false);}}
  useEffect(()=>{
    let active=true;
    Promise.all([adminApi.me(),adminApi.status(),adminApi.approvals(),adminApi.signals(),adminApi.audit()])
      .then(([current,health,requests,market,auditRows])=>{if(!active)return;setUser(current);setStatus(health);setApprovals(requests);setSignals(market);setAudit(auditRows);setError('');})
      .catch(problem=>{if(!active)return;setUser(null);setError(problem instanceof Error?problem.message:'조회에 실패했습니다');})
      .finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;};
  },[]);
  async function login(event:FormEvent<HTMLFormElement>){event.preventDefault();const data=new FormData(event.currentTarget);setError('');try{await adminApi.signin(String(data.get('email')),String(data.get('password')));const options=await adminApi.operatorMfaOptions();const credential=await navigator.credentials.get({publicKey:decodeRequestOptions(options.publicKey)});if(!credential)throw new Error('운영자 보안키 확인이 취소됐습니다');await adminApi.operatorMfaAuthenticate(options.challengeId,credentialJson(credential));await load();}catch(problem){setError(problem instanceof Error?problem.message:'로그인에 실패했습니다');}}
  async function proposeEthereum(event:FormEvent<HTMLFormElement>){event.preventDefault();const data=new FormData(event.currentTarget);setError('');try{const review=await adminApi.proposeEthereumPayout(String(data.get('withdrawalId')),Number(data.get('checkerId')),String(data.get('reason')));setEthereumReview(review);}catch(problem){setError(problem instanceof Error?problem.message:'ETH 지급 검토를 만들지 못했습니다');}}
  async function inspectEthereum(event:FormEvent<HTMLFormElement>){event.preventDefault();const data=new FormData(event.currentTarget);setError('');try{setEthereumReview(await adminApi.inspectEthereumPayout(String(data.get('reviewId'))));}catch(problem){setError(problem instanceof Error?problem.message:'ETH 지급 검토를 읽지 못했습니다');}}
  async function decideEthereum(approve:boolean){if(!ethereumReview)return;setError('');try{const options=await adminApi.ethereumPayoutOptions(ethereumReview.payload.id,ethereumReview.payloadHash,approve);const credential=await navigator.credentials.get({publicKey:decodeRequestOptions(options.authentication.publicKey)});if(!credential)throw new Error('승인 보안키 확인이 취소됐습니다');setEthereumReview(await adminApi.decideEthereumPayout(ethereumReview.payload.id,ethereumReview.payloadHash,approve,{challengeId:options.authentication.challengeId,credential:credentialJson(credential)}));}catch(problem){setError(problem instanceof Error?problem.message:'ETH 지급 결정을 완료하지 못했습니다');}}
  if(loading)return <main className="min-h-screen grid place-items-center text-gray-400">운영 상태를 확인하고 있습니다.</main>;
  if(!user)return <main className="min-h-screen grid place-items-center p-6"><form onSubmit={login} className="w-full max-w-sm rounded-lg border border-gray-700 bg-[#181a20] p-6 space-y-4"><Brand label="CEX 운영자"/><p className="text-sm text-gray-400">승인된 운영자 계정과 추가 인증 장치가 필요합니다.</p><input name="email" type="email" required placeholder="이메일" className="w-full rounded bg-[#0b0e11] border border-gray-600 p-3"/><input name="password" type="password" required placeholder="비밀번호" className="w-full rounded bg-[#0b0e11] border border-gray-600 p-3"/>{error&&<p role="alert" className="text-sm text-red-400">{error}</p>}<button className="w-full rounded bg-yellow-500 py-3 font-semibold text-black">로그인</button></form></main>;
  return <main className="min-h-screen">
    <header className="border-b border-gray-800 bg-[#181a20] px-6 py-4 flex justify-between"><Brand label="CEX 운영 통제"/><div className="text-sm text-gray-400">{user.email} <button className="ml-4 text-yellow-500" onClick={async()=>{await adminApi.logout();location.reload();}}>로그아웃</button></div></header>
    <div className="p-6 grid gap-5 xl:grid-cols-2">
      {error&&<p role="alert" className="xl:col-span-2 rounded border border-red-800 bg-red-950 p-3">{error}</p>}
      <Section title="운영 상태"><div className="flex items-center gap-3 mb-4"><StateBadge tone={status?.status==='UP'?'good':'bad'}>{status?.status??'UNKNOWN'}</StateBadge><time className="text-xs text-gray-500">{status?.observedAt}</time></div><div className="grid gap-2">{status?.queues.map(queue=><div key={queue.name} className="flex justify-between border-b border-gray-800 py-2 text-sm"><span>{queue.name}</span><span className={queue.pending?'text-yellow-500':'text-gray-400'}>{queue.pending}건 · 최장 {queue.oldestSeconds??0}초</span></div>)}</div></Section>
      <Section title="승인 대기"><JsonRows rows={approvals} empty="대기 중인 승인 요청이 없습니다."/></Section>
      <Section title="시장감시 신호"><JsonRows rows={signals} empty="확인할 시장감시 신호가 없습니다."/></Section>
      <Section title="최근 감사 기록"><JsonRows rows={audit} empty="조회된 감사 기록이 없습니다."/></Section>
      <Section title="ETH 지급 검토" description="담당자 제안과 지정된 다른 승인자의 최근 열람·보안키 서명이 모두 필요합니다."><div className="grid gap-4 md:grid-cols-2"><form onSubmit={proposeEthereum} className="space-y-2"><input name="withdrawalId" required placeholder="출금 UUID" className="w-full rounded border border-gray-600 bg-[#0b0e11] p-2"/><input name="checkerId" type="number" min="1" required placeholder="승인자 번호" className="w-full rounded border border-gray-600 bg-[#0b0e11] p-2"/><textarea name="reason" required minLength={10} placeholder="지급 근거와 확인 내용" className="w-full rounded border border-gray-600 bg-[#0b0e11] p-2"/><button className="rounded bg-yellow-500 px-4 py-2 font-semibold text-black">검토 제안</button></form><form onSubmit={inspectEthereum} className="space-y-2"><input name="reviewId" required placeholder="검토 UUID" className="w-full rounded border border-gray-600 bg-[#0b0e11] p-2"/><button className="rounded bg-gray-700 px-4 py-2">지정 검토 열람</button></form></div>{ethereumReview&&<div className="mt-4 rounded bg-[#0b0e11] p-3 text-sm"><p>상태 <strong>{ethereumReview.state}</strong></p><p className="break-all">출금 {ethereumReview.payload.withdrawalId}</p><p>{ethereumReview.payload.amount} ETH → <span className="break-all">{ethereumReview.payload.address}</span></p><p className="mt-2 text-gray-400">{ethereumReview.payload.reason}</p>{ethereumReview.state==='PENDING'&&<div className="mt-3 flex gap-2"><button onClick={()=>void decideEthereum(true)} className="rounded bg-green-600 px-4 py-2">승인 서명</button><button onClick={()=>void decideEthereum(false)} className="rounded bg-red-600 px-4 py-2">거절 서명</button></div>}</div>}</Section>
    </div>
  </main>;
}

function JsonRows({rows,empty}:{rows:Record<string,unknown>[];empty:string}){if(rows.length===0)return <p className="text-sm text-gray-500">{empty}</p>;return <div className="space-y-2">{rows.slice(0,10).map((row,index)=><pre key={String(row.id??index)} className="overflow-auto rounded bg-[#0b0e11] p-3 text-xs text-gray-300">{JSON.stringify(row,null,2)}</pre>)}</div>;}
