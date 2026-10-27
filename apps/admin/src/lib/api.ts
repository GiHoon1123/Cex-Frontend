import type {PublicKeyCredentialCreationOptionsJSON,PublicKeyCredentialRequestOptionsJSON} from '@cex/ui/webauthn';

export interface User {id:number;email:string;username:string|null}
export interface QueueState {name:string;pending:number;oldestSeconds:number|null}
export interface OperationsStatus {status:string;observedAt:string;queues:QueueState[]}
export interface MfaOptions {challengeId:string;publicKey:PublicKeyCredentialRequestOptionsJSON}
export interface MfaRegistrationOptions {challengeId:string;publicKey:PublicKeyCredentialCreationOptionsJSON}
export interface EthereumPayoutReview {payload:{id:string;withdrawalId:string;customerId:number;network:string;address:string;amount:string;fee:string;total:string;requester:{id:number};checker:{id:number};reason:string;expiresAt:string};payloadHash:string;state:string}

function csrfCookie(){return document.cookie.split('; ').find(value=>value.startsWith('cex_admin_csrf='))?.slice('cex_admin_csrf='.length)??null;}

class AdminApi {
  private async csrf(){const token=csrfCookie();if(token)return token;const response=await fetch('/api/session/csrf',{credentials:'same-origin'});if(!response.ok)throw new Error('요청 보호 토큰을 만들지 못했습니다');return (await response.json()).token as string;}
  async request<T>(path:string,options:RequestInit={}):Promise<T>{
    const headers=new Headers(options.headers);headers.set('Content-Type','application/json');
    if(options.method&&options.method!=='GET'&&options.method!=='HEAD')headers.set('X-CSRF-Token',await this.csrf());
    const response=await fetch(`/api/platform${path}`,{...options,headers,credentials:'same-origin',signal:options.signal??AbortSignal.timeout(10000)});
    if(!response.ok){
      const body=await response.json().catch(()=>({})) as Record<string,unknown>;
      const detail=typeof body.message==='string'?body.message:typeof body.error==='string'?body.error:'';
      if(detail&&/[\u3131-\uD79D]/.test(detail))throw new Error(detail);
      if(response.status===401)throw new Error('운영자 세션이 만료됐습니다. 다시 로그인해 주세요.');
      if(response.status===403)throw new Error('운영 권한, 최초 등록 비밀, 보안키 조건을 확인해 주세요.');
      if(response.status===503)throw new Error('필요한 내부 처리기가 준비되지 않았습니다.');
      throw new Error(detail||`요청에 실패했습니다 (${response.status}).`);
    }
    // Spring의 반환값 없는 명령은 환경에 따라 200 빈 본문 또는 204를 반환한다.
    // 성공한 보안키 등록을 JSON 파싱 오류로 바꾸지 않고 둘을 같은 완료로 처리한다.
    if(response.status===204)return undefined as T;
    const raw=await response.text();
    return (raw?JSON.parse(raw):undefined) as T;
  }
  signin(email:string,password:string){return this.request<{user:User;message:string}>('/api/auth/signin',{method:'POST',body:JSON.stringify({email,password})});}
  operatorMfaRegistrationOptions(enrollmentToken:string){return this.request<MfaRegistrationOptions>('/api/auth/operator-mfa/register/options',{method:'POST',body:JSON.stringify({enrollmentToken})});}
  operatorMfaRegister(challengeId:string,publicKey:unknown){return this.request<void>('/api/auth/operator-mfa/register',{method:'POST',body:JSON.stringify({challengeId,publicKey})});}
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
