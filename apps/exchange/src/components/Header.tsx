'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import { apiClient, SessionState } from '@/lib/api';
import {Brand} from '@cex/ui';

export default function Header() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  // 인증 저장소를 구독한다. 서버 렌더는 비로그인 상태로 시작해 수화 결과를 맞춘다.
  const isAuthenticated = useSyncExternalStore(SessionState.subscribe, SessionState.hasSession, () => false);
  const handleLoginSuccess = () => {
    setShowLogin(false);
    window.location.reload();
  };

  const handleLogout = async () => {
    try {
      await apiClient.logout();
      // 로그아웃 후 페이지 새로고침하여 모든 상태 초기화
      window.location.replace(new URL('/', window.location.origin).href);
    } catch (error) {
      console.error('Logout error:', error);
      // 에러가 발생해도 로컬 상태는 업데이트하고 페이지 새로고침
      window.location.replace(new URL('/', window.location.origin).href);
    }
  };

  return (
    <>
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <Brand label="CEX 거래소" />
            </Link>

            {/* 고객 인증 상태에 따라 거래 메뉴와 로그인 동작을 나눈다. */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/trades"
                    className="text-gray-300 hover:text-white px-4 py-2 transition-colors"
                  >
                    거래내역
                  </Link>
                  <Link
                    href="/mypage"
                    className="text-gray-300 hover:text-white px-4 py-2 transition-colors"
                  >
                    마이페이지
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowLogin(true)}
                    className="text-gray-300 hover:text-white px-4 py-2 transition-colors"
                  >
                    로그인
                  </button>
                  <button
                    onClick={() => setShowSignup(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                  >
                    회원가입
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 인증 창은 한 번에 하나만 열어 화면 읽기 순서를 유지한다. */}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={handleLoginSuccess}
          onSwitchToSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
        />
      )}

      {showSignup && (
        <SignupModal
          onClose={() => setShowSignup(false)}
          onSuccess={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
          onSwitchToLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
        />
      )}


    </>
  );
}

