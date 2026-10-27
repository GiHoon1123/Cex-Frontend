import type {PublicKeyCredentialRequestOptionsJSON} from '@cex/ui/webauthn';

export interface User {id:number;email:string;username:string|null}
export interface QueueState {name:string;pending:number;oldestSeconds:number|null}
export interface OperationsStatus {status:string;observedAt:string;queues:QueueState[]}
export interface MfaOptions {challengeId:string;publicKey:PublicKeyCredentialRequestOptionsJSON}
export interface EthereumPayoutReview {payload:{id:string;withdrawalId:string;customerId:number;network:string;address:string;amount:string;fee:string;total:string;requester:{id:number};checker:{id:number};reason:string;expiresAt:string};payloadHash:string;state:string}

function csrfCookie(){return document.cookie.split('; ').find(value=>value.startsWith('cex_admin_csrf='))?.slice('cex_admin_csrf='.length)??null;}

class AdminApi {
  private async csrf(){const token=csrfCookie();if(token)return token;const response=await fetch('/api/session/csrf',{credentials:'same-origin'});if(!response.ok)throw new Error('요청 보호 토큰을 만들지 못했습니다');return (await response.json()).token as string;}
  async request<T>(path:string,options:RequestInit={}):Promise<T>{
    const headers=new Headers(options.headers);headers.set('Content-Type','application/json');
    if(options.method&&options.method!=='GET'&&options.method!=='HEAD')headers.set('X-CSRF-Token',await this.csrf());
    const response=await fetch(`/api/platform${path}`,{...options,headers,credentials:'same-origin',signal:options.signal??AbortSignal.timeout(10000)});
    if(!response.ok){const body=await response.json().catch(()=>({}));throw new Error(body.message??body.error??`요청 실패 (${response.status})`);}
    if(response.status===204)return undefined as T;
    return response.json() as Promise<T>;
  }
  signin(email:string,password:string){return this.request<{user:User;message:string}>('/api/auth/signin',{method:'POST',body:JSON.stringify({email,password})});}
  operatorMfaOptions(){return this.request<MfaOptions>('/api/auth/operator-mfa/authenticate/options',{method:'POST',body:'{}'});}
  operatorMfaAuthenticate(challengeId:string,publicKey:unknown){return this.request<{message?:string}>('/api/auth/operator-mfa/authenticate',{method:'POST',body:JSON.stringify({challengeId,publicKey})});}
  me(){return this.request<User>('/api/auth/me');}
  status(){return this.request<OperationsStatus>('/api/admin/operations/status');}
  approvals(){return this.request<Record<string,unknown>[]>('/api/admin/requests?page=0');}
  audit(){return this.request<Record<string,unknown>[]>('/api/admin/audit?page=0');}
  signals(){return this.request<Record<string,unknown>[]>('/api/admin/market-surveillance/signals?page=0');}
  proposeEthereumPayout(withdrawalId:string,checkerId:number,reason:string){return this.request<EthereumPayoutReview>('/api/admin/withdrawals/ETH/payout-reviews',{method:'POST',body:JSON.stringify({withdrawalId,checkerId,requestKey:crypto.randomUUID(),reason})});}
  inspectEthereumPayout(id:string){return this.request<EthereumPayoutReview>(`/api/admin/withdrawals/ETH/payout-reviews/${id}/inspect`,{method:'POST',body:''});}
  ethereumPayoutOptions(id:string,payloadHash:string,approve:boolean){return this.request<{review:EthereumPayoutReview;approve:boolean;authentication:MfaOptions}>(`/api/admin/withdrawals/ETH/payout-reviews/${id}/${approve?'approve':'reject'}/options`,{method:'POST',body:JSON.stringify({payloadHash})});}
  decideEthereumPayout(id:string,payloadHash:string,approve:boolean,proof:{challengeId:string;credential:unknown}){return this.request<EthereumPayoutReview>(`/api/admin/withdrawals/ETH/payout-reviews/${id}/${approve?'approve':'reject'}`,{method:'POST',body:JSON.stringify({payloadHash,proof})});}
  logout(){return this.request<{message:string}>('/api/auth/logout',{method:'POST',body:'{}'});}
}
export const adminApi=new AdminApi();
