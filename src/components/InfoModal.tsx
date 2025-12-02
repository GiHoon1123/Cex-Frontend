'use client';

import { useEffect } from 'react';

export type InfoModalType = 'info' | 'warning';

interface InfoModalProps {
  title: string;
  message: string;
  type?: InfoModalType;
  isOpen: boolean;
  onClose: () => void;
}

export default function InfoModal({ title, message, type = 'info', isOpen, onClose }: InfoModalProps) {
  useEffect(() => {
    if (isOpen) {
      // ESC 키로 닫기
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const iconColor = type === 'warning' ? 'text-yellow-400' : 'text-blue-400';
  const icon = type === 'warning' ? '⚠' : 'ℹ';
  const borderColor = type === 'warning' ? 'border-yellow-600' : 'border-blue-600';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className={`bg-gray-800 border-2 ${borderColor} rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-2xl font-bold ${iconColor}`}>
              {icon}
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-white text-lg font-semibold mb-2">{title}</h3>
              <p className="text-gray-300 text-base leading-relaxed whitespace-pre-line">{message}</p>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className={`px-6 py-2.5 rounded transition-colors font-medium text-sm ${
                type === 'warning'
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

