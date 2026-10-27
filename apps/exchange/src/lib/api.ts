import type {PublicKeyCredentialCreationOptionsJSON,PublicKeyCredentialRequestOptionsJSON} from '@cex/ui/webauthn';

export interface UserResponse {id:number;email:string;username:string|null;createdAt:string;updatedAt:string}
export interface SignupRequest {email:string;password:string;username?:string}
export interface SigninRequest {email:string;password:string}
export interface SigninResponse {user:UserResponse;message:string}
export interface SignupResponse {user:UserResponse;message:string}
export interface Balance {userId:number;mintAddress:string;available:string;locked:string;total:string}
export interface AssetPosition {mint:string;currentBalance:string;available:string;locked:string;averageEntryPrice:string|null;currentMarketPrice:string|null;currentValue:string|null;unrealizedPnl:string|null;unrealizedPnlPercent:string|null;tradeSummary:{totalBuyTrades:number;totalSellTrades:number;realizedPnl:string}}
export interface CreateOrderRequest {orderType:'buy'|'sell';orderSide:'limit'|'market';baseMint:string;quoteMint:string;price?:string;amount?:string;quoteAmount?:string}
export interface Order {id:string;userId:number;orderType:string;orderSide:string;baseMint:string;quoteMint:string;price:string|null;amount:string;filledAmount:string;filledQuoteAmount:string;status:'pending'|'partial'|'filled'|'cancelled'|'rejected';createdAt:string;updatedAt:string}
export interface Trade {id:string;buyOrderId:string;sellOrderId:string;baseMint:string;quoteMint:string;price:string;amount:string;createdAt:string}
interface Page<T> {content:T[];page:number;size:number;totalElements:number;totalPages:number}
export type SubmissionResult = {state:'accepted'|'existing';order:Order} | {state:'uncertain';orderId:string};
export type CustodyAsset='BTC'|'ETH';
export interface DepositAddress {id:string;asset:CustodyAsset;network:string;address:string;createdAt:string}
export interface KycSession {status:{attemptId:string;creationState:string;identityStatus:string|null;providerStatus:string|null;validUntil:string|null;environment:string;lastConfirmedAt:string|null;reconciliationOutcome:string|null};verificationUrl:string|null}
export interface WithdrawalQuote {payload:{id:string;network:string;asset:CustodyAsset;address:string;amount:string;fee:string;total:string;policy:string;expiresAt:string};payloadHash:string;state:string;assurance:string}
export interface WithdrawalReceipt {withdrawalId:string;state:string;network:string;address:string;amount:string;fee:string;total:string;policy:string;quoteHash:string}

/** 브라우저에는 토큰 대신 화면 갱신용 힌트만 둔다. 서버는 쿠키의 실제 세션을 매 요청마다 검증한다. */
export class SessionState {
  private static key='cex_session_hint';
  static hasSession(){return typeof window!=='undefined'&&localStorage.getItem(SessionState.key)==='1';}
  static set(active:boolean){if(typeof window==='undefined')return;if(active)localStorage.setItem(SessionState.key,'1');else localStorage.removeItem(SessionState.key);window.dispatchEvent(new Event('auth-changed'));}
  static subscribe(listener:()=>void){window.addEventListener('storage',listener);window.addEventListener('auth-changed',listener);return()=>{window.removeEventListener('storage',listener);window.removeEventListener('auth-changed',listener);};}
}

export class ApiError extends Error {
  status:number;
  constructor(status:number,message:string){super(message);this.status=status;}
}
function csrfCookie(){return document.cookie.split('; ').find(value=>value.startsWith('cex_csrf='))?.slice('cex_csrf='.length)??null;}

export class ApiClient {
  private refreshing:Promise<void>|null=null;
  private async csrf(){let token=csrfCookie();if(token)return token;const response=await fetch('/api/session/csrf',{credentials:'same-origin'});if(!response.ok)throw new ApiError(response.status,'요청 보호 토큰을 만들지 못했습니다');token=(await response.json()).token;return token!;}
  private async request(endpoint:string,options:RequestInit={},retry=true):Promise<Response>{
    const headers=new Headers(options.headers);headers.set('Content-Type','application/json');
    if(options.method&&options.method!=='GET'&&options.method!=='HEAD')headers.set('X-CSRF-Token',await this.csrf());
    const response=await fetch(`/api/platform${endpoint}`,{...options,headers,credentials:'same-origin',signal:options.signal??AbortSignal.timeout(10000)});
    if(response.status===401&&retry&&SessionState.hasSession()&&!endpoint.startsWith('/api/auth/')){this.refreshing??=this.refresh().then(()=>{}).finally(()=>{this.refreshing=null;});await this.refreshing;return this.request(endpoint,options,false);}
    if(!response.ok){const body=await response.json().catch(()=>({}));if(response.status===401)SessionState.set(false);throw new ApiError(response.status,body.message??body.error??`요청 실패 (${response.status})`);}
    return response;
  }
  private async json<T>(path:string,options:RequestInit={}):Promise<T>{return (await this.request(path,options)).json();}
  isAuthenticated(){return SessionState.hasSession();}
  signup(data:SignupRequest){return this.json<SignupResponse>('/api/auth/signup',{method:'POST',body:JSON.stringify(data)});}
  async signin(data:SigninRequest){const result=await this.json<SigninResponse>('/api/auth/signin',{method:'POST',body:JSON.stringify(data)});SessionState.set(true);return result;}
  async refresh(){try{await this.json<{message:string}>('/api/auth/refresh',{method:'POST',body:'{}'});SessionState.set(true);}catch(error){SessionState.set(false);throw error;}}
  async logout(){SessionState.set(false);await this.request('/api/auth/logout',{method:'POST',keepalive:true,body:'{}'},false);}
  getMe(){return this.json<UserResponse>('/api/auth/me');}
  getBalances(){return this.json<Balance[]>('/api/cex/balances');}
  getPositions(){return this.json<AssetPosition[]>('/api/cex/positions');}
  getPosition(mint:string){return this.json<AssetPosition>(`/api/cex/positions/${encodeURIComponent(mint)}`);}
  async createOrder(request:CreateOrderRequest,key:string):Promise<SubmissionResult>{const response=await this.request('/api/cex/orders',{method:'POST',headers:{'Idempotency-Key':key},body:JSON.stringify(request)});const body=await response.json();if(response.status===202)return{state:'uncertain',orderId:body.orderId};return{state:response.status===201?'accepted':'existing',order:body.order};}
  async getMyOrders(status?:string,size=100,page=0){const params=new URLSearchParams({size:String(size),page:String(page)});if(status)params.set('status',status);return(await this.json<Page<Order>>(`/api/cex/orders/my?${params}`)).content;}
  async cancelOrder(id:string){return(await this.json<{order:Order}>(`/api/cex/orders/${encodeURIComponent(id)}`,{method:'DELETE'})).order;}
  async getOrder(id:string){return(await this.json<{order:Order}>(`/api/cex/orders/${encodeURIComponent(id)}`)).order;}
  async getMyTrades(mint='BTC',size=100,page=0){return(await this.json<Page<Trade>>(`/api/cex/trades/my?${new URLSearchParams({mint,size:String(size),page:String(page)})}`)).content;}
  getKyc(){return this.json<KycSession>('/api/kyc/session');}
  startKyc(key:string){return this.json<KycSession>('/api/kyc/session',{method:'POST',headers:{'Idempotency-Key':key},body:'{}'});}
  customerMfaRegistrationOptions(currentPassword:string){return this.json<{challengeId:string;publicKey:PublicKeyCredentialCreationOptionsJSON}>('/api/auth/customer-mfa/register/options',{method:'POST',body:JSON.stringify({currentPassword})});}
  registerCustomerMfa(challengeId:string,publicKey:unknown){return this.json<{id:string;requiresLogin:boolean}>('/api/auth/customer-mfa/register',{method:'POST',body:JSON.stringify({challengeId,publicKey})});}
  getDepositAddress(asset:CustodyAsset){return this.json<DepositAddress>(`/api/customer/deposit-addresses/${asset}`);}
  issueDepositAddress(asset:CustodyAsset){return this.json<DepositAddress>(`/api/customer/deposit-addresses/${asset}`,{method:'POST',body:'{}'});}
  async getDeposits(asset:CustodyAsset){const result=await this.json<unknown>(`/api/customer/deposits/${asset}`);if(Array.isArray(result))return result as Record<string,unknown>[];const page=result as {items?:Record<string,unknown>[]};return page.items??[];}
  prepareWithdrawal(asset:CustodyAsset,address:string,amount:string,key:string){return this.json<WithdrawalQuote>(`/api/customer/withdrawals/${asset}/quotes`,{method:'POST',headers:{'Idempotency-Key':key},body:JSON.stringify({address,amount})});}
  withdrawalOptions(asset:CustodyAsset,quote:string){return this.json<{challengeId:string;purpose:string;quote:WithdrawalQuote;publicKey:PublicKeyCredentialRequestOptionsJSON}>(`/api/customer/withdrawals/${asset}/quotes/${quote}/authorization-options`,{method:'POST',body:'{}'});}
  reserveWithdrawal(asset:CustodyAsset,quote:string,challengeId:string,publicKey:unknown){return this.json<WithdrawalReceipt>(`/api/customer/withdrawals/${asset}/quotes/${quote}/reservations`,{method:'POST',body:JSON.stringify({challengeId,publicKey})});}
}
export const apiClient=new ApiClient();
