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
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const [showLoginInfoModal, setShowLoginInfoModal] = useState(false);
  const [shouldShowLoginInfo, markLoginInfoAsSeen] = useOnceModal('has_seen_login_wallet_info');

  // 초기 로드 시 인증 상태 확인
  useEffect(() => {
    setIsAuthenticated(apiClient.isAuthenticated());
  }, []);

  // 로그인 성공 후 팝업 표시 체크
  useEffect(() => {
    if (justLoggedIn && shouldShowLoginInfo) {
      setShowLoginInfoModal(true);
      setJustLoggedIn(false);
    }
  }, [justLoggedIn, shouldShowLoginInfo]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setShowLogin(false);
    setJustLoggedIn(true);
  };

  const handleCloseLoginInfo = () => {
    setShowLoginInfoModal(false);
    markLoginInfoAsSeen();
  };

  const handleLogout = async () => {
    try {
      await apiClient.logout();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      // 에러가 발생해도 로컬 상태는 업데이트
      setIsAuthenticated(false);
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
          message="마이페이지에서 지갑을 생성하면 모의 투자를 위한 지갑주소와 가상의 자산이 생성됩니다."
          type="info"
          isOpen={showLoginInfoModal}
          onClose={handleCloseLoginInfo}
        />
      )}
    </>
  );
}

