// 요청 제한 테스트 스크립트
// 브라우저 콘솔에서 실행하세요
// 사용법: 브라우저 개발자 도구(F12) > Console 탭에서 이 파일의 내용을 복사해서 실행

(async function testRateLimit() {
  console.log('=== 요청 제한 테스트 시작 ===');
  console.log('1분에 60개 이상의 요청을 발생시킵니다...\n');
  
  // apiClient는 전역으로 export되어 있으므로 직접 접근 불가
  // 대신 fetch를 직접 사용하여 테스트
  const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3002'
    : '';
  
  const endpoint = '/api/cex/positions';
  const url = `${API_BASE_URL}${endpoint}`;
  
  // 토큰 가져오기
  const token = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
  
  let successCount = 0;
  let errorCount = 0;
  let rateLimitErrorCount = 0;
  
  // 65개 요청 발생 (60개 제한 초과)
  const requests = [];
  for (let i = 0; i < 65; i++) {
    requests.push(
      fetch(url, { headers })
        .then(response => {
          if (response.ok) {
            successCount++;
            console.log(`[${i + 1}] 요청 성공`);
          } else {
            errorCount++;
            if (response.status === 429 || response.statusText.includes('제한')) {
              rateLimitErrorCount++;
              console.log(`[${i + 1}] 요청 제한 에러`);
            } else {
              console.log(`[${i + 1}] 요청 실패: ${response.status}`);
            }
          }
        })
        .catch(error => {
          errorCount++;
          if (error.message.includes('제한') || error.message.includes('초과')) {
            rateLimitErrorCount++;
            console.log(`[${i + 1}] 요청 제한 에러: ${error.message}`);
          } else {
            console.log(`[${i + 1}] 네트워크 에러: ${error.message}`);
          }
        })
    );
  }
  
  // 모든 요청 완료 대기
  await Promise.all(requests);
  
  console.log('\n=== 테스트 결과 ===');
  console.log(`총 요청 수: 65`);
  console.log(`성공: ${successCount}`);
  console.log(`실패: ${errorCount}`);
  console.log(`요청 제한 에러: ${rateLimitErrorCount}`);
  console.log('\nAlertModal이 표시되었는지 확인하세요!');
})();

