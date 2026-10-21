import {test,expect,Page,WebSocketRoute} from '@playwright/test';
const at='2026-10-21T00:00:00Z';
function snapshot(sequence='1',amount?:string) {
  return {book:{engine_id:'c76095ec-2ac4-40d1-a6ac-1a7a7f61f32a',sequence,previous_sequence:'0',base_mint:'BTC',quote_mint:'USDT',timestamp:at,bids:[],asks:amount?[['60000',amount]]:[]},trades:sequence==='1'?[]:[{id:'public-trade',price:'60000',amount:'0.001',side:'buy',timestamp:at}]};
}
async function publicRoutes(page:Page,candles:unknown[]=[]) {
  const requests:string[]=[];
  page.on('request',request=>requests.push(request.url()));
  // 모의 플랫폼 출처는 예약 도메인이다. 놓친 요청이 기존 로컬 서비스로 갈 수 없다.
  await page.route('http://platform.invalid/**',async route=> {
    const path=new URL(route.request().url()).pathname;
    let body:unknown;
    if(path.endsWith('/candles'))body=candles;
    else if(path==='/api/cex/balances')body=[{userId:1,mintAddress:'BTC',available:'1.000000001',locked:'0',total:'1.000000001'},{userId:1,mintAddress:'USDT',available:'1000',locked:'0',total:'1000'}];
    else if(path==='/api/cex/positions')body=[];
    else if(path==='/api/auth/me')body={id:1,email:'browser@local.test',username:'검증 사용자',createdAt:at,updatedAt:at};
    else {await route.abort();return;}
    await route.fulfill({json:body,headers:{'access-control-allow-origin':'*'}});
  });
  return requests;
}
test('자체 호가·체결을 표시하고 역순과 재연결을 안전하게 처리한다',async({page})=> {
  const requests=await publicRoutes(page);const sockets:WebSocketRoute[]=[];let current=snapshot();
  await page.routeWebSocket('ws://platform.invalid/ws/market/BTC/USDT',socket=>{sockets.push(socket);socket.send(JSON.stringify(current));});
  await page.goto('/');
  const book=page.getByRole('region',{name:'자체 호가창'});
  await expect(book.getByText('매도 호가 없음')).toBeVisible();
  await expect(page.getByRole('region',{name:'최근 자체 체결'}).getByText('아직 체결이 없습니다.')).toBeVisible();
  current=snapshot('2','0.002');sockets.at(-1)!.send(JSON.stringify(current));
  await expect(book.getByText('0.002',{exact:true})).toBeVisible();
  sockets.at(-1)!.send(JSON.stringify(snapshot('1','999')));
  await expect(book.getByText('0.002',{exact:true})).toBeVisible();
  const before=sockets.length;current=snapshot('3');await sockets.at(-1)!.close({code:1000,reason:'재연결 검증'});
  await expect.poll(()=>sockets.length).toBeGreaterThan(before);
  await expect(book.getByText('매도 호가 없음')).toBeVisible();
  expect(requests.some(url=>/binance|3002|solusdt/i.test(url))).toBe(false);
});
test('결과 불명 주문은 새로고침 뒤에도 같은 키·본문으로 확인한다',async({page})=> {
  await page.addInitScript(()=>{localStorage.setItem('access_token','test-access');localStorage.setItem('refresh_token','test-refresh');});
  await publicRoutes(page);
  const calls:{key:string|undefined;body:string|null}[]=[];
  await page.route('http://platform.invalid/api/cex/orders',async route=> {
    const request=route.request();calls.push({key:request.headers()['idempotency-key'],body:request.postData()});
    const order={id:'9007199254740993',status:'pending'};
    await route.fulfill({status:calls.length===1?202:200,json:calls.length===1?{orderId:order.id}:{order},headers:{'access-control-allow-origin':'*'}});
  });
  await page.routeWebSocket('ws://platform.invalid/ws/market/BTC/USDT',socket=>socket.send(JSON.stringify(snapshot())));
  await page.goto('/');const panel=page.getByRole('region',{name:'주문 입력'});
  await panel.getByLabel('가격 (USDT)',{exact:true}).fill('60000');await panel.getByLabel('수량 (BTC)',{exact:true}).fill('0.001');
  await panel.getByRole('button',{name:'BTC 매수',exact:true}).click();
  await expect(panel.getByText(/엔진 접수 결과 확인 필요/)).toBeVisible();
  await expect(panel.getByLabel('가격 (USDT)',{exact:true})).toBeDisabled();
  await page.reload();
  await panel.getByRole('button',{name:'같은 주문 접수 확인'}).click();
  await expect(panel.getByText(/기존 주문 9007199254740993 조회됨/)).toBeVisible();
  expect(calls).toHaveLength(2);expect(calls[0]).toEqual(calls[1]);expect(calls[0].key).toMatch(/^[0-9a-f-]{36}$/);
  expect(JSON.parse(calls[0].body!)).toEqual({orderType:'buy',orderSide:'limit',baseMint:'BTC',quoteMint:'USDT',price:'60000',amount:'0.001'});
});
test('자체 체결 봉으로 차트를 렌더링하고 외부 위젯을 로드하지 않는다',async({page})=> {
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  const requests=await publicRoutes(page,[{time:1792540800,open:'60000',high:'60010',low:'59990',close:'60005',volume:'0.002'}]);
  await page.routeWebSocket('ws://platform.invalid/ws/market/BTC/USDT',socket=>socket.send(JSON.stringify(snapshot('2','0.002'))));
  await page.goto('/');await expect(page.getByLabel('BTC 자체 체결 차트').locator('canvas').first()).toBeVisible();
  await expect(page.getByText('체결이 발생하면 차트가 표시됩니다.')).toHaveCount(0);
  expect(errors).toEqual([]);expect(requests.some(url=>url.includes('tv.js')||url.includes('binance'))).toBe(false);
});
