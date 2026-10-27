'use client';

import {FormEvent,useEffect,useState,useSyncExternalStore} from 'react';
import {useRouter} from 'next/navigation';
import {apiClient,CustodyAsset,DepositAddress,KycSession,SessionState,WithdrawalReceipt} from '@/lib/api';
import {credentialJson,decodeCreationOptions,decodeRequestOptions,registrationJson} from '@cex/ui/webauthn';

/** 고객이 실제 플랫폼의 KYC·입금·출금 상태를 한 화면에서 확인하는 최소 자산 업무 화면이다. */
export default function MyPage(){
  const router=useRouter(),authenticated=useSyncExternalStore(SessionState.subscribe,SessionState.hasSession,()=>false);
  const [asset,setAsset]=useState<CustodyAsset>('BTC');
  const [kyc,setKyc]=useState<KycSession|null>(null),[address,setAddress]=useState<DepositAddress|null>(null);
  const [deposits,setDeposits]=useState<Record<string,unknown>[]>([]),[withdrawal,setWithdrawal]=useState<WithdrawalReceipt|null>(null);
  const [message,setMessage]=useState(''),[busy,setBusy]=useState(false);
  useEffect(()=>{if(!apiClient.isAuthenticated())router.push('/');},[router]);
  useEffect(()=>{
    if(!authenticated)return;
    let active=true;
    Promise.all([apiClient.getKyc().catch(()=>null),apiClient.getDepositAddress(asset).catch(()=>null),apiClient.getDeposits(asset).catch(()=>[])])
      .then(([identity,depositAddress,history])=>{if(active){setKyc(identity);setAddress(depositAddress);setDeposits(history);}})
      .finally(()=>{if(active)setBusy(false);});
    return()=>{active=false;};
  },[asset,authenticated]);
  async function startKyc(){try{setBusy(true);const next=await apiClient.startKyc(crypto.randomUUID());setKyc(next);if(next.verificationUrl)window.open(next.verificationUrl,'_blank','noopener,noreferrer');setMessage('본인확인 세션을 만들었습니다. 완료 후 상태를 새로 확인하세요.');}catch(problem){setMessage(problem instanceof Error?problem.message:'본인확인을 시작하지 못했습니다');}finally{setBusy(false);}}
  async function registerPasskey(event:FormEvent<HTMLFormElement>){
    event.preventDefault();const password=String(new FormData(event.currentTarget).get('password'));setBusy(true);setMessage('');
    try{
      const options=await apiClient.customerMfaRegistrationOptions(password);
      const credential=await navigator.credentials.create({publicKey:decodeCreationOptions(options.publicKey)});
      if(!credential)throw new Error('보안키 등록이 취소됐습니다');
      await apiClient.registerCustomerMfa(options.challengeId,registrationJson(credential,'고객 출금 보안키'));
      SessionState.set(false);setMessage('보안키를 등록했습니다. 기존 세션은 회수되므로 다시 로그인하세요.');
    }catch(problem){setMessage(problem instanceof Error?problem.message:'보안키를 등록하지 못했습니다');}finally{setBusy(false);}
  }
  async function issueAddress(){try{setBusy(true);setAddress(await apiClient.issueDepositAddress(asset));setMessage('입금 주소를 발급했습니다. 반드시 표시된 네트워크만 사용하세요.');}catch(problem){setMessage(problem instanceof Error?problem.message:'입금 주소를 발급하지 못했습니다');}finally{setBusy(false);}}
  async function withdraw(event:FormEvent<HTMLFormElement>){
    event.preventDefault();const form=new FormData(event.currentTarget);setBusy(true);setMessage('');
    try{
      const quote=await apiClient.prepareWithdrawal(asset,String(form.get('address')),String(form.get('amount')),crypto.randomUUID());
      const options=await apiClient.withdrawalOptions(asset,quote.payload.id);
      const credential=await navigator.credentials.get({publicKey:decodeRequestOptions(options.publicKey)});
      if(!credential)throw new Error('보안키 확인이 취소됐습니다');
      const result=await apiClient.reserveWithdrawal(asset,quote.payload.id,options.challengeId,credentialJson(credential));
      setWithdrawal(result);setMessage('출금이 예약됐습니다. 운영 심사와 체인 확정 전까지 완료로 표시하지 않습니다.');
    }catch(problem){setMessage(problem instanceof Error?problem.message:'출금 요청을 완료하지 못했습니다');}finally{setBusy(false);}
  }
  if(!authenticated)return null;
  return <main className="mx-auto max-w-6xl p-4 md:p-8 space-y-5">
    <header><h1 className="text-2xl font-semibold">마이페이지</h1><p className="mt-1 text-sm text-gray-400">본인확인과 입출금의 확정 상태를 플랫폼에서 직접 조회합니다.</p></header>
    {message&&<p role="status" className="rounded border border-yellow-700 bg-yellow-950/40 p-3 text-sm">{message}</p>}
    <div className="grid gap-5 lg:grid-cols-2"><section className="rounded-lg border border-gray-700 bg-[#181a20] p-5"><div className="flex items-center justify-between"><div><h2 className="font-semibold">고객 확인</h2><p className="text-sm text-gray-400">상태: {kyc?.status.identityStatus??kyc?.status.creationState??'확인 필요'}</p></div><button disabled={busy} onClick={startKyc} className="rounded bg-yellow-500 px-4 py-2 font-semibold text-black disabled:opacity-50">본인확인 시작</button></div></section><section className="rounded-lg border border-gray-700 bg-[#181a20] p-5"><h2 className="font-semibold">출금 보안키</h2><p className="mt-1 text-xs text-gray-400">확인된 이메일과 현재 비밀번호가 필요하며, 등록 후 모든 세션이 회수됩니다.</p><form onSubmit={registerPasskey} className="mt-3 flex gap-2"><input name="password" type="password" required placeholder="현재 비밀번호" className="min-w-0 flex-1 rounded border border-gray-600 bg-[#0b0e11] p-2"/><button disabled={busy} className="rounded bg-gray-700 px-4 py-2 disabled:opacity-50">보안키 등록</button></form></section></div>
    <div className="flex gap-2" role="tablist" aria-label="입출금 자산">{(['BTC','ETH'] as const).map(value=><button role="tab" aria-selected={asset===value} key={value} onClick={()=>setAsset(value)} className={`rounded px-5 py-2 ${asset===value?'bg-yellow-500 text-black':'bg-gray-800 text-gray-300'}`}>{value}</button>)}</div>
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-lg border border-gray-700 bg-[#181a20] p-5 space-y-4"><h2 className="font-semibold">{asset} 입금</h2>{address?<><p className="text-xs text-gray-400">{address.network}</p><code className="block break-all rounded bg-[#0b0e11] p-3 text-sm">{address.address}</code></>:<button disabled={busy} onClick={issueAddress} className="rounded bg-[#f0b90b] px-4 py-2 font-semibold text-[#0b0e11] disabled:opacity-50">입금 주소 발급</button>}<div><h3 className="mb-2 text-sm font-medium">최근 입금</h3>{deposits.length?<div className="space-y-2">{deposits.slice(0,8).map((item,index)=><pre key={String(item.id??index)} className="overflow-auto rounded bg-[#0b0e11] p-2 text-xs">{JSON.stringify(item,null,2)}</pre>)}</div>:<p className="text-sm text-gray-500">표시할 입금이 없습니다.</p>}</div></section>
      <section className="rounded-lg border border-gray-700 bg-[#181a20] p-5"><h2 className="font-semibold">{asset} 출금</h2><p className="mt-1 text-xs text-gray-400">고정 고객 수수료 0.01% · 주소와 총액을 보안키로 다시 확인합니다.</p><form onSubmit={withdraw} className="mt-4 space-y-3"><label className="block text-sm">지급 주소<input name="address" required className="mt-1 w-full rounded border border-gray-600 bg-[#0b0e11] p-3"/></label><label className="block text-sm">지급 수량<input name="amount" required inputMode="decimal" className="mt-1 w-full rounded border border-gray-600 bg-[#0b0e11] p-3"/></label><button disabled={busy} className="w-full rounded bg-red-600 py-3 font-semibold disabled:opacity-50">견적 확인 후 출금 서명</button></form>{withdrawal&&<div className="mt-4 rounded bg-[#0b0e11] p-3 text-sm"><p>상태 <strong>{withdrawal.state}</strong></p><p>지급 {withdrawal.amount} {asset}</p><p>수수료 {withdrawal.fee} {asset}</p><p>총 예약 {withdrawal.total} {asset}</p></div>}</section>
    </div>
  </main>;
}
