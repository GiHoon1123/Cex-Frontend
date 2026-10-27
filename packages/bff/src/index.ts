import {cookies} from 'next/headers';
import {NextRequest,NextResponse} from 'next/server';

export interface ProxyConfig {accessCookie:string;refreshCookie:string;csrfCookie:string;publicOriginEnvironment:string}

function platformOrigin(){const configured=process.env.PLATFORM_INTERNAL_URL;if(configured)return configured.replace(/\/$/,'');if(process.env.NODE_ENV==='development')return'http://127.0.0.1:8080';throw new Error('PLATFORM_INTERNAL_URL이 필요합니다');}
function mutation(method:string){return !['GET','HEAD','OPTIONS'].includes(method);}
function cookieOptions(){return{httpOnly:true,sameSite:'strict' as const,secure:process.env.NODE_ENV==='production',path:'/'};}
function sameOrigin(request:NextRequest,environment:string){
  const origin=request.headers.get('origin');if(!origin)return false;
  try{
    const configured=process.env[environment];
    if(configured)return new URL(origin).origin===new URL(configured).origin;
    // 운영에서는 전달 헤더를 신뢰하지 않고 배포 설정의 공개 출처를 반드시 요구한다.
    if(process.env.NODE_ENV==='production')return false;
    const source=new URL(origin);const host=request.headers.get('x-forwarded-host')??request.headers.get('host');const protocol=request.headers.get('x-forwarded-proto')??request.nextUrl.protocol.replace(':','');
    return source.host===host&&source.protocol===`${protocol}:`;
  }catch{return false;}
}

export function createPlatformProxy(config:ProxyConfig){
  return async function proxy(request:NextRequest,{params}:{params:Promise<{path:string[]}>}){
    const path=(await params).path.join('/');const store=await cookies();
    if(mutation(request.method)){
      const csrf=request.headers.get('x-csrf-token');
      if(!sameOrigin(request,config.publicOriginEnvironment)||!csrf||csrf!==store.get(config.csrfCookie)?.value)return NextResponse.json({message:'요청 출처를 확인할 수 없습니다'},{status:403});
    }
    const headers=new Headers({'Content-Type':request.headers.get('content-type')??'application/json'});const idempotency=request.headers.get('idempotency-key');if(idempotency)headers.set('Idempotency-Key',idempotency);const access=store.get(config.accessCookie)?.value;if(access)headers.set('Authorization',`Bearer ${access}`);
    let body=mutation(request.method)?await request.text():undefined;if(path==='api/auth/refresh'||path==='api/auth/logout')body=JSON.stringify({refreshToken:store.get(config.refreshCookie)?.value??''});
    let upstream:Response;try{upstream=await fetch(`${platformOrigin()}/${path}${request.nextUrl.search}`,{method:request.method,headers,body,cache:'no-store',signal:AbortSignal.timeout(10000)});}catch{return NextResponse.json({message:'플랫폼 응답을 확인할 수 없습니다'},{status:503});}
    const raw=await upstream.text();let payload:unknown=raw;try{payload=raw?JSON.parse(raw):null;}catch{}
    if(payload&&typeof payload==='object'){
      const values=payload as Record<string,unknown>;const accessToken=typeof values.accessToken==='string'?values.accessToken:null;const refreshToken=typeof values.refreshToken==='string'?values.refreshToken:null;
      if(accessToken&&refreshToken){delete values.accessToken;delete values.refreshToken;const response=NextResponse.json(values,{status:upstream.status});response.cookies.set(config.accessCookie,accessToken,{...cookieOptions(),maxAge:15*60});response.cookies.set(config.refreshCookie,refreshToken,{...cookieOptions(),maxAge:7*24*3600});response.headers.set('Cache-Control','no-store');return response;}
    }
    const response=payload===null?new NextResponse(null,{status:upstream.status}):typeof payload==='string'?new NextResponse(payload,{status:upstream.status}):NextResponse.json(payload,{status:upstream.status});
    if(path==='api/auth/logout'||upstream.status===401){response.cookies.set(config.accessCookie,'',{...cookieOptions(),maxAge:0});response.cookies.set(config.refreshCookie,'',{...cookieOptions(),maxAge:0});}
    response.headers.set('Cache-Control','no-store');return response;
  };
}
