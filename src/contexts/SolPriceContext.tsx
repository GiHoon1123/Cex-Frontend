'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface SolPriceContextType {
  solPrice: number | null;
  priceChange: number;
}

const SolPriceContext = createContext<SolPriceContextType>({
  solPrice: null,
  priceChange: 0,
});

export function SolPriceProvider({ children }: { children: ReactNode }) {
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number>(0);

  useEffect(() => {
    // 초기 가격 가져오기 (REST API)
    const fetchInitialPrice = async () => {
      try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT');
        const data = await response.json();
        const price = parseFloat(data.price) || null;
        if (price) setSolPrice(price);
      } catch (error) {
        console.error('SOL 초기 가격 가져오기 실패:', error);
      }
    };

    fetchInitialPrice();

    // WebSocket으로 실시간 가격 받기
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/solusdt@ticker');

    ws.onopen = () => {
      console.log('SolPriceContext: SOL 가격 WebSocket 연결됨');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const price = parseFloat(data.c) || null; // 현재가 (last price)
        const change = parseFloat(data.P) || 0; // 24시간 변동률
        
        if (price && price > 0) {
          setSolPrice(price);
          setPriceChange(change);
        }
      } catch (error) {
        console.error('SOL 가격 WebSocket 데이터 파싱 실패:', error);
      }
    };

    ws.onerror = (error) => {
      console.warn('SolPriceContext: SOL 가격 WebSocket 연결 오류');
    };

    ws.onclose = () => {
      console.warn('SolPriceContext: SOL 가격 WebSocket 연결 종료');
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <SolPriceContext.Provider value={{ solPrice, priceChange }}>
      {children}
    </SolPriceContext.Provider>
  );
}

export function useSolPrice() {
  return useContext(SolPriceContext);
}

