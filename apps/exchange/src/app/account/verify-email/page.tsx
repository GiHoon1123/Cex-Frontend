'use client';

import {Suspense,useState} from 'react';
import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import {apiClient} from '@/lib/api';

/** 메일 보안 스캐너의 링크 조회만으로 주소를 확인하지 않고 고객의 명시적 버튼 입력으로 확정한다. */
function Verification(){
  const query=useSearchParams(),challenge=query.get('challenge')??'',token=query.get('token')??'';
  const valid=Boolean(challenge&&token);
  const [message,setMessage]=useState(valid?'아래 버튼을 눌러 이메일 주소 확인을 완료하세요.':'이메일 확인 링크가 올바르지 않습니다.'),[busy,setBusy]=useState(false),[done,setDone]=useState(false);
  async function confirm(){try{setBusy(true);const status=await apiClient.confirmEmailVerification(challenge,token);setDone(status.verified);setMessage(status.verified?'이메일 주소를 확인했습니다. 이제 출금 보안키를 등록할 수 있습니다.':'이메일 주소를 확인하지 못했습니다.');}catch(problem){setMessage(problem instanceof Error?problem.message:'이메일 주소를 확인하지 못했습니다.');}finally{setBusy(false);}}
  return <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl items-center p-4"><section className="w-full rounded-lg border border-[#2b3139] bg-[#181a20] p-6"><h1 className="text-xl font-semibold">이메일 주소 확인</h1><p role="status" className="mt-3 text-sm text-gray-300">{message}</p><div className="mt-5 flex gap-3">{!done&&<button type="button" disabled={busy||!challenge||!token} onClick={confirm} className="rounded bg-[#f0b90b] px-4 py-2 font-semibold text-[#0b0e11] disabled:opacity-50">{busy?'확인 중...':'이메일 확인 완료'}</button>}<Link href="/mypage" className="rounded bg-[#2b3139] px-4 py-2 text-white">마이페이지로 이동</Link></div></section></main>;
}

export default function VerifyEmailPage(){return <Suspense fallback={<main className="p-6 text-gray-300">이메일 확인 화면을 준비하고 있습니다.</main>}><Verification/></Suspense>;}
