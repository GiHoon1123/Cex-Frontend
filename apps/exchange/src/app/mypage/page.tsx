'use client';
import {useEffect,useState} from 'react';
import {apiClient,UserResponse} from '@/lib/api';
import AssetList from '@/components/AssetList';

/** 계정과 거래소 잔액을 표시한다. 지원하지 않는 솔라나 지갑 생성 경로는 제거한다. */
export default function MyPage() {
  const [user,setUser]=useState<UserResponse|null>(null),[error,setError]=useState('');
  useEffect(()=>{apiClient.getMe().then(setUser).catch(()=>setError('로그인 후 계정을 확인해주세요.'));},[]);
  return <main className="max-w-3xl mx-auto p-8"><h1 className="text-2xl font-semibold mb-6">내 계정</h1>
    {error&&<p role="alert" className="text-red-400">{error}</p>}
    {user&&<section className="mb-6 bg-gray-800 rounded-lg p-5"><p>{user.email}</p><p className="text-gray-400 mt-2">{user.username}</p></section>}
    <AssetList />
  </main>;
}
