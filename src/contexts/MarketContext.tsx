'use client';
import {createContext,useContext,useEffect,useState,ReactNode} from 'react';
import {acceptSnapshot,MarketView} from '@/lib/market';
import {marketSocketUrl} from '@/lib/platform';

const MarketContext=createContext<{view:MarketView|null;connected:boolean}>({view:null,connected:false});
/** 화면 전체가 소켓 하나를 공유한다. 연결·재연결 첫 메시지부터 전체 상태를 받아
 * REST 스냅샷과 스트림 사이의 경합을 만들지 않는다. 오래된 화면은 연결 해제로 표시한다. */
export function MarketProvider({children}:{children:ReactNode}) {
  const [view,setView]=useState<MarketView|null>(null),[connected,setConnected]=useState(false);
  useEffect(()=> {
    let stopped=false;let socket:WebSocket;let timer:ReturnType<typeof setTimeout>;
    let lastMessage=Date.now();
    const connect=()=> {
      if(stopped)return;
      socket=new WebSocket(marketSocketUrl(window.location.origin));
      socket.onmessage=event=> {
        if(stopped)return;
        lastMessage=Date.now();
        try {
          const next=JSON.parse(event.data);
          if(next.status){setConnected(false);return;}
          setView(current=>acceptSnapshot(current,next));setConnected(true);
        } catch {setConnected(false);socket.close();}
      };
      socket.onerror=()=>socket.close();
      socket.onclose=()=>{if(stopped)return;setConnected(false);timer=setTimeout(connect,1000);};
    };
    connect();
    // 끊김 통지를 받지 못한 연결도 심박이 사라지면 닫아 전체 상태를 다시 받는다.
    const watchdog=setInterval(()=>{if(Date.now()-lastMessage>30000){setConnected(false);socket.close();}},5000);
    return()=>{stopped=true;clearTimeout(timer);clearInterval(watchdog);socket.close();};
  },[]);
  return <MarketContext.Provider value={{view,connected}}>{children}</MarketContext.Provider>;
}
export function useMarket(){return useContext(MarketContext);}
