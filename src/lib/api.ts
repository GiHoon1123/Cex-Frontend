import { PLATFORM_ORIGIN } from './platform.ts';

export interface UserResponse {id:number;email:string;username:string|null;createdAt:string;updatedAt:string}
export interface SignupRequest {email:string;password:string;username?:string}
export interface SigninRequest {email:string;password:string}
export interface SigninResponse {user:UserResponse;accessToken:string;refreshToken:string;message:string}
export interface SignupResponse {user:UserResponse;message:string}
export interface RefreshTokenResponse {accessToken:string;refreshToken:string;message:string}
export interface Balance {userId:number;mintAddress:string;available:string;locked:string;total:string}
export interface AssetPosition {
  mint:string;currentBalance:string;available:string;locked:string;averageEntryPrice:string|null;
  currentMarketPrice:string|null;currentValue:string|null;unrealizedPnl:string|null;unrealizedPnlPercent:string|null;
  tradeSummary:{totalBuyTrades:number;totalSellTrades:number;realizedPnl:string};
}
export interface CreateOrderRequest {
  orderType:'buy'|'sell';orderSide:'limit'|'market';baseMint:string;quoteMint:string;
  price?:string;amount?:string;quoteAmount?:string;
}
export interface Order {
  id:string;userId:number;orderType:string;orderSide:string;baseMint:string;quoteMint:string;
  price:string|null;amount:string;filledAmount:string;filledQuoteAmount:string;
  status:'pending'|'partial'|'filled'|'cancelled'|'rejected';createdAt:string;updatedAt:string;
}
export interface Trade {id:string;buyOrderId:string;sellOrderId:string;baseMint:string;quoteMint:string;price:string;amount:string;createdAt:string}
interface Page<T> {content:T[];page:number;size:number;totalElements:number;totalPages:number}
export type SubmissionResult = {state:'accepted'|'existing';order:Order} | {state:'uncertain';orderId:string};

/** 저장 키는 서버 응답 필드명과 독립적이다. 토큰을 로그·URL에 넣지 않는다. */
export class TokenStorage {
  static getAccessToken() {return typeof window==='undefined'?null:localStorage.getItem('access_token');}
  static getRefreshToken() {return typeof window==='undefined'?null:localStorage.getItem('refresh_token');}
  static setTokens(access:string,refresh:string) {localStorage.setItem('access_token',access);localStorage.setItem('refresh_token',refresh);window.dispatchEvent(new Event('auth-changed'));}
  static clearTokens() {if(typeof window!=='undefined'){localStorage.removeItem('access_token');localStorage.removeItem('refresh_token');window.dispatchEvent(new Event('auth-changed'));}}
  static subscribe(listener:()=>void) {
    window.addEventListener('storage',listener);window.addEventListener('auth-changed',listener);
    return ()=>{window.removeEventListener('storage',listener);window.removeEventListener('auth-changed',listener);};
  }
  static hasTokens() {return !!TokenStorage.getAccessToken() && !!TokenStorage.getRefreshToken();}
}
/** 명시적인 HTTP 거부와 통신 결과 불명을 구분한다. */
export class ApiError extends Error {
  status:number;
  constructor(status:number,message:string){super(message);this.status=status;}
}
export class ApiClient {
  private refreshing:Promise<void>|null=null;
  private async request(endpoint:string,options:RequestInit={},retry=true):Promise<Response> {
    const headers=new Headers(options.headers);headers.set('Content-Type','application/json');
    const token=TokenStorage.getAccessToken();
    if(token && !endpoint.startsWith('/api/auth/sign') && !endpoint.startsWith('/api/auth/refresh')) headers.set('Authorization',`Bearer ${token}`);
    const response=await fetch(`${PLATFORM_ORIGIN}${endpoint}`,{...options,headers,signal:options.signal??AbortSignal.timeout(10000)});
    if(response.status===401 && retry && token && !endpoint.startsWith('/api/auth/')) {
      // 갱신을 한 번만 공유한다. 주문 재전송도 원래 헤더의 동일 키를 유지한다.
      this.refreshing??=this.refresh().then(()=>{}).finally(()=>{this.refreshing=null;});
      await this.refreshing;return this.request(endpoint,options,false);
    }
    if(!response.ok) {
      const body=await response.json().catch(()=>({}));
      throw new ApiError(response.status,body.message ?? body.error ?? `요청 실패 (${response.status})`);
    }
    return response;
  }
  private async json<T>(path:string,options:RequestInit={}):Promise<T> {return (await this.request(path,options)).json();}
  isAuthenticated(){return TokenStorage.hasTokens();}
  signup(data:SignupRequest){return this.json<SignupResponse>('/api/auth/signup',{method:'POST',body:JSON.stringify(data)});}
  async signin(data:SigninRequest){const result=await this.json<SigninResponse>('/api/auth/signin',{method:'POST',body:JSON.stringify(data)});TokenStorage.setTokens(result.accessToken,result.refreshToken);return result;}
  async refresh(){
    try {const result=await this.json<RefreshTokenResponse>('/api/auth/refresh',{method:'POST',body:JSON.stringify({refreshToken:TokenStorage.getRefreshToken()})});TokenStorage.setTokens(result.accessToken,result.refreshToken);return result;}
    catch(error){TokenStorage.clearTokens();throw error;}
  }
  async logout(){
    const refreshToken=TokenStorage.getRefreshToken();
    // 서버 응답 유실이나 화면 이동이 로컬 로그아웃을 막지 않도록 먼저 지운다.
    TokenStorage.clearTokens();
    await this.request('/api/auth/logout',{method:'POST',keepalive:true,body:JSON.stringify({refreshToken})});
  }
  getMe(){return this.json<UserResponse>('/api/auth/me');}
  getBalances(){return this.json<Balance[]>('/api/cex/balances');}
  getPositions(){return this.json<AssetPosition[]>('/api/cex/positions');}
  getPosition(mint:string){return this.json<AssetPosition>(`/api/cex/positions/${encodeURIComponent(mint)}`);}
  async createOrder(request:CreateOrderRequest,key:string):Promise<SubmissionResult> {
    // 키는 화면이 새 주문 의도에 한 번 부여한다. 통신 실패를 이유로 이곳에서
    // 키를 새로 만들거나 다른 주문으로 바꾸지 않는다.
    const response=await this.request('/api/cex/orders',{method:'POST',headers:{'Idempotency-Key':key},body:JSON.stringify(request)});
    const body=await response.json();
    if(response.status===202) return {state:'uncertain',orderId:body.orderId};
    return {state:response.status===201?'accepted':'existing',order:body.order};
  }
  async getMyOrders(status?:string,size=100,page=0) {
    const params=new URLSearchParams({size:String(size),page:String(page)});if(status)params.set('status',status);
    return (await this.json<Page<Order>>(`/api/cex/orders/my?${params}`)).content;
  }
  async cancelOrder(id:string){return (await this.json<{order:Order}>(`/api/cex/orders/${encodeURIComponent(id)}`,{method:'DELETE'})).order;}
  async getOrder(id:string){return (await this.json<{order:Order}>(`/api/cex/orders/${encodeURIComponent(id)}`)).order;}
  async getMyTrades(mint='BTC',size=100,page=0){return (await this.json<Page<Trade>>(`/api/cex/trades/my?${new URLSearchParams({mint,size:String(size),page:String(page)})}`)).content;}
}
export const apiClient=new ApiClient();
