/** 개발은 플랫폼 포트, 배포는 같은 출처의 리버스 프록시를 사용한다.
 * 엔진 주소나 외부 거래소 주소를 브라우저 설정으로 제공하지 않는다. */
export const PLATFORM_ORIGIN = process.env.NEXT_PUBLIC_PLATFORM_URL ??
  (process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : '');

export function marketSocketUrl(pageOrigin: string): string {
  const url = new URL('/ws/market/BTC/USDT', PLATFORM_ORIGIN || pageOrigin);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
}
