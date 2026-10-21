import {test,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {ApiClient,ApiError,TokenStorage} from '../src/lib/api.ts';
import {acceptSnapshot} from '../src/lib/market.ts';
import type {MarketView} from '../src/lib/market.ts';
import {marketSocketUrl} from '../src/lib/platform.ts';

beforeEach(()=> {
  const values=new Map<string,string>();
  Object.defineProperty(globalThis,'window',{configurable:true,value:{dispatchEvent:()=>{}}});
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>values.set(key,value),removeItem:(key:string)=>values.delete(key)}});
});
const request={orderType:'buy',orderSide:'limit',baseMint:'BTC',quoteMint:'USDT',price:'60000',amount:'0.001'} as const;
const response=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});

test('플랫폼 로그인 응답의 정식 필드로 토큰을 저장한다',async()=> {
  globalThis.fetch=async()=>response({accessToken:'access',refreshToken:'refresh',user:{id:1}});
  await new ApiClient().signin({email:'user@local.test',password:'test'});
  assert.equal(TokenStorage.getAccessToken(),'access');assert.equal(TokenStorage.getRefreshToken(),'refresh');
});
test('잔액 배열과 페이지 주문 응답을 정확히 읽고 큰 ID를 문자열로 유지한다',async()=> {
  const client=new ApiClient();
  globalThis.fetch=async(input)=>String(input).includes('/balances')?response([{mintAddress:'BTC',available:'0.000000001',locked:'0'}]):response({content:[{id:'9007199254740993'}]});
  assert.equal((await client.getBalances())[0].available,'0.000000001');assert.equal((await client.getMyOrders())[0].id,'9007199254740993');
});
test('결과 불명 202를 체결 성공으로 처리하지 않고 같은 키와 본문을 보낸다',async()=> {
  const calls:{key:string|null;body:BodyInit|null|undefined}[]=[];
  globalThis.fetch=async(_input,options)=>{calls.push({key:new Headers(options?.headers).get('Idempotency-Key'),body:options?.body});return response({orderId:'9007199254740993'},202);};
  const client=new ApiClient();const key='d77598a6-b975-4d1a-8b46-c723e91577c0';
  assert.deepEqual(await client.createOrder(request,key),{state:'uncertain',orderId:'9007199254740993'});
  await client.createOrder(request,key);assert.deepEqual(calls[0],calls[1]);assert.equal(calls[0].key,key);
});
test('기존 접수 200과 신규 엔진 접수 201을 구분한다',async()=> {
  const client=new ApiClient();globalThis.fetch=async()=>response({order:{id:'1',status:'pending'}},200);
  assert.equal((await client.createOrder(request,'key')).state,'existing');
  globalThis.fetch=async()=>response({order:{id:'2',status:'pending'}},201);
  assert.equal((await client.createOrder(request,'key')).state,'accepted');
});
test('인증 갱신 뒤에도 주문 키를 바꾸지 않는다',async()=> {
  TokenStorage.setTokens('old','refresh');const keys:string[]=[];
  globalThis.fetch=async(input,options)=> {
    if(String(input).includes('/auth/refresh'))return response({accessToken:'new',refreshToken:'new-refresh'});
    keys.push(new Headers(options?.headers).get('Idempotency-Key')!);
    return keys.length===1?response({message:'expired'},401):response({order:{id:'1'}},201);
  };
  await new ApiClient().createOrder(request,'same-key');assert.deepEqual(keys,['same-key','same-key']);
});
test('통신 실패를 자동으로 새 주문 제출로 바꾸지 않는다',async()=> {
  let calls=0;globalThis.fetch=async()=>{calls++;throw new TypeError('응답 유실');};
  await assert.rejects(()=>new ApiClient().createOrder(request,'same-key'));assert.equal(calls,1);
});
test('명시적인 입력 거부와 결과 불명 오류를 구분할 수 있다',async()=> {
  globalThis.fetch=async()=>response({message:'잘못된 수량'},400);
  await assert.rejects(()=>new ApiClient().createOrder(request,'same-key'),error=>error instanceof ApiError && error.status===400);
});
function view(sequence:string,engine='engine'):MarketView {return {book:{engine_id:engine,sequence,previous_sequence:'0',base_mint:'BTC',quote_mint:'USDT',timestamp:'2026-10-21T00:00:00Z',bids:[],asks:[]},trades:[]};}
test('큰 순번의 중복·역순은 무시하고 누락 뒤에는 전체 스냅샷으로 바꾼다',()=> {
  const current=view('9007199254740993');assert.equal(acceptSnapshot(current,view('9007199254740992')),current);
  assert.equal(acceptSnapshot(current,view('9007199254740993')),current);
  assert.equal(acceptSnapshot(current,view('9007199254740996')).book.sequence,'9007199254740996');
  assert.equal(acceptSnapshot(current,view('1','replacement')).book.sequence,'1');
});
test('다른 시장의 프레임은 BTC 화면에 적용하지 않는다',()=> {
  const wrong=view('1');wrong.book.base_mint='SOL';assert.throws(()=>acceptSnapshot(null,wrong));
});
test('공개 소켓은 플랫폼 진입 경로를 사용한다',()=> {
  assert.equal(marketSocketUrl('https://exchange.local'),'wss://exchange.local/ws/market/BTC/USDT');
});

test('인증 저장소 조회 함수를 분리해 구독 콜백으로 전달해도 동작한다',()=> {
  TokenStorage.setTokens('access','refresh');const snapshot=TokenStorage.hasTokens;assert.equal(snapshot(),true);
});
