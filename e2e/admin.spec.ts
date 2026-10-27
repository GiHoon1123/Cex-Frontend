import {expect,test} from '@playwright/test';

test('운영자 토큰을 브라우저에 노출하지 않고 고객 세션과 분리한다',async({page,request})=>{
  await page.addInitScript(()=>{
    const credential={toJSON:()=>({id:'credential',rawId:'AQID',type:'public-key',response:{authenticatorData:'AQID',clientDataJSON:'AQID',signature:'AQID',userHandle:null}})};
    Object.defineProperty(navigator,'credentials',{configurable:true,value:{get:async()=>credential}});
  });
  await page.goto('http://127.0.0.1:3104');
  await expect(page.getByText('승인된 운영자 계정과 추가 인증 장치가 필요합니다.')).toBeVisible();
  await page.getByPlaceholder('이메일').fill('operator@example.com');
  await page.getByPlaceholder('비밀번호').fill('correct-password');
  await page.getByRole('button',{name:'로그인'}).click();
  await expect(page.getByText('CEX 운영 통제')).toBeVisible();
  await expect(page.getByText('ORDER_DISPATCH')).toBeVisible();
  await expect(page.getByText('OPERATOR_LOGIN')).toBeVisible();

  const exposed=await page.evaluate(()=>({cookies:document.cookie,access:localStorage.getItem('access_token'),refresh:localStorage.getItem('refresh_token')}));
  expect(exposed.cookies).not.toContain('admin-access');
  expect(exposed.cookies).not.toContain('admin-refresh');
  expect(exposed.access).toBeNull();expect(exposed.refresh).toBeNull();

  // 포트가 다른 고객 앱에는 운영자 쿠키가 전송되지 않아야 한다.
  const customer=await request.get('http://127.0.0.1:3103/api/platform/api/auth/me');
  expect(customer.status()).toBe(401);
  // 출처와 이중 제출 토큰이 없는 상태 변경은 플랫폼으로 전달하기 전에 거부한다.
  const forged=await request.post('http://127.0.0.1:3104/api/platform/api/auth/logout',{data:{}});
  expect(forged.status()).toBe(403);
});

test('최초 등록 비밀로 보안키를 등록한 뒤 별도 서명으로 로그인한다',async({page})=>{
  let created=0,authenticated=0;
  await page.addInitScript(()=>{
    const registration={toJSON:()=>({id:'registered',rawId:'AQID',type:'public-key',response:{attestationObject:'AQID',clientDataJSON:'AQID'}})};
    const assertion={toJSON:()=>({id:'registered',rawId:'AQID',type:'public-key',response:{authenticatorData:'AQID',clientDataJSON:'AQID',signature:'AQID',userHandle:null}})};
    Object.defineProperty(navigator,'credentials',{configurable:true,value:{create:async()=>{(window as unknown as {created:number}).created=1;return registration;},get:async()=>{(window as unknown as {authenticated:number}).authenticated=1;return assertion;}}});
  });
  await page.goto('http://127.0.0.1:3104');
  await page.getByPlaceholder('이메일').fill('operator@example.com');
  await page.getByPlaceholder('비밀번호',{exact:true}).fill('correct-password');
  await page.getByPlaceholder('일회성 최초 등록 비밀').fill('x'.repeat(43));
  await page.getByRole('button',{name:'로그인'}).click();
  await expect(page.getByText('CEX 운영 통제')).toBeVisible();
  [created,authenticated]=await page.evaluate(()=>[(window as unknown as {created:number}).created,(window as unknown as {authenticated:number}).authenticated]);
  expect(created).toBe(1);expect(authenticated).toBe(1);
});
