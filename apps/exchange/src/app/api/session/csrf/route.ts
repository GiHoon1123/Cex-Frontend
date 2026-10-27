import {randomBytes} from 'node:crypto';
import {NextResponse} from 'next/server';

export async function GET(){
  const token=randomBytes(32).toString('base64url');
  const response=NextResponse.json({token});
  response.cookies.set('cex_csrf',token,{httpOnly:false,sameSite:'strict',secure:process.env.NODE_ENV==='production',path:'/',maxAge:3600});
  response.headers.set('Cache-Control','no-store');
  return response;
}
