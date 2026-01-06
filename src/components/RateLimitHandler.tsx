'use client';

import { useEffect, useState } from 'react';
import AlertModal from './AlertModal';

export default function RateLimitHandler() {
  const [alert, setAlert] = useState<{
    isOpen: boolean;
    message: string;
  }>({
    isOpen: false,
    message: '',
  });

  useEffect(() => {
    const handleRateLimitExceeded = (event: Event) => {
      const customEvent = event as CustomEvent<{
        message: string;
        remainingRequests: number;
      }>;
      
      setAlert({
        isOpen: true,
        message: customEvent.detail.message || '현재 서버가 불안정하여 전체 요청이 제한되어 있습니다.\n1분에 60개 요청으로 제한되어 있으며, 잠시 후 다시 시도해주세요.',
      });
    };

    // 전역 이벤트 리스너 등록
    if (typeof window !== 'undefined') {
      window.addEventListener('rateLimitExceeded', handleRateLimitExceeded);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('rateLimitExceeded', handleRateLimitExceeded);
      }
    };
  }, []);

  const handleClose = () => {
    setAlert({ isOpen: false, message: '' });
  };

  return (
    <AlertModal
      message={alert.message}
      type="error"
      isOpen={alert.isOpen}
      onClose={handleClose}
    />
  );
}

