'use client';

export default function ServerMaintenanceBanner() {
  const message = "⚠️ 서버 점검: 매일 00:00/08:00/16:00 (KST) 재시작 및 데이터 초기화";

  return (
    <div className="bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 text-white py-2 overflow-hidden relative z-50 shadow-lg">
      <div className="flex animate-scroll whitespace-nowrap">
        {/* 여러 번 반복하여 무한 스크롤 효과 */}
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="inline-block px-12 text-sm font-semibold">
            {message}
          </span>
        ))}
      </div>
    </div>
  );
}

