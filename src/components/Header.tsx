'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import InfoModal from './InfoModal';
import { apiClient } from '@/lib/api';
import { useOnceModal } from '@/hooks/useOnceModal';

export default function Header() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginInfoModal, setShowLoginInfoModal] = useState(false);
  const [shouldShowLoginInfo, markLoginInfoAsSeen] = useOnceModal('has_seen_login_wallet_info');

  // 초기 로드 시 인증 상태 확인
  useEffect(() => {
    setIsAuthenticated(apiClient.isAuthenticated());
  }, []);


  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setShowLogin(false);
    // 로그인 성공 시 localStorage를 다시 확인하여 알림 표시 여부 결정
    const hasSeen = typeof window !== 'undefined' ? localStorage.getItem('has_seen_login_wallet_info') : null;
    if (!hasSeen) {
      // 약간의 지연을 두어 로그인 모달이 완전히 닫힌 후 알림 표시
      setTimeout(() => {
        setShowLoginInfoModal(true);
      }, 500);
    }
  };

  const handleCloseLoginInfo = () => {
    setShowLoginInfoModal(false);
    markLoginInfoAsSeen();
  };

  const handleLogout = async () => {
    try {
      await apiClient.logout();
      setIsAuthenticated(false);
      // 로그아웃 후 메인 페이지로 이동
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // 에러가 발생해도 로컬 상태는 업데이트하고 메인 페이지로 이동
      setIsAuthenticated(false);
      router.push('/');
    }
  };

  return (
    <>
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <h1 className="text-xl font-bold text-white">Solana Exchange</h1>
            </Link>

            {/* Right side - Auth buttons */}
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

      {/* Modals */}
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

      {/* 로그인 시 지갑 정보 안내 팝업 */}
      {showLoginInfoModal && (
        <InfoModal
          title="모의 투자 안내"
          message="지갑을 생성하면 모의거래를 위한 자산이 지급됩니다."
          type="info"
          isOpen={showLoginInfoModal}
          onClose={handleCloseLoginInfo}
        />
      )}
    </>
  );
}

