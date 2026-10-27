import {createServer} from 'node:http';

const json=(response,status,body)=>{response.writeHead(status,{'Content-Type':'application/json'});response.end(JSON.stringify(body));};
const server=createServer((request,response)=>{
  const authorized=request.headers.authorization==='Bearer admin-access';
  if(request.url==='/api/health/live')return json(response,200,{status:'UP'});
  if(request.url==='/api/auth/signin'&&request.method==='POST')return json(response,200,{accessToken:'admin-access',refreshToken:'admin-refresh',user:{id:7,email:'operator@example.com',username:'operator'},message:'로그인 성공'});
  if(request.url==='/api/auth/logout'&&request.method==='POST')return json(response,200,{message:'로그아웃 성공'});
  if(!authorized)return json(response,401,{message:'인증이 필요합니다'});
  if(request.url==='/api/auth/me')return json(response,200,{id:7,email:'operator@example.com',username:'operator'});
  if(request.url==='/api/admin/operations/status')return json(response,200,{status:'UP',observedAt:'2026-10-27T00:00:00Z',queues:[{name:'ORDER_DISPATCH',pending:0,oldestSeconds:null}]});
  if(request.url==='/api/admin/requests?page=0')return json(response,200,[]);
  if(request.url==='/api/admin/market-surveillance/signals?page=0')return json(response,200,[]);
  if(request.url==='/api/admin/audit?page=0')return json(response,200,[{id:'audit-1',action:'OPERATOR_LOGIN'}]);
  return json(response,404,{message:'경로를 찾을 수 없습니다'});
});
server.listen(18080,'127.0.0.1');

for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
