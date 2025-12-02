'use client';

import { useState, useEffect } from 'react';

/**
 * 한번만 보이는 모달을 관리하는 훅
 * @param storageKey localStorage에 저장할 키
 * @returns [shouldShow, markAsSeen] - 표시 여부와 본 것으로 표시하는 함수
 */
export function useOnceModal(storageKey: string): [boolean, () => void] {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // localStorage에서 이미 본 팝업인지 확인
    const hasSeen = localStorage.getItem(storageKey);
    if (!hasSeen) {
      setShouldShow(true);
    }
  }, [storageKey]);

  const markAsSeen = () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(storageKey, 'true');
    setShouldShow(false);
  };

  return [shouldShow, markAsSeen];
}

