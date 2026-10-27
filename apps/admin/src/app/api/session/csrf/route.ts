import {randomBytes} from 'node:crypto';
import {NextResponse} from 'next/server';

export async function GET(){
  const token=randomBytes(32).toString('hex');
  const response=NextResponse.json({token});
  // 이 값은 자바스크립트가 요청 헤더에 복사해야 하므로 인증 쿠키와 달리 읽을 수 있어야 한다.
  response.cookies.set('cex_admin_csrf',token,{httpOnly:false,sameSite:'strict',secure:process.env.NODE_ENV==='production',path:'/'});
  response.headers.set('Cache-Control','no-store');
  return response;
}
