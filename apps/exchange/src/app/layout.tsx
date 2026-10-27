import AutoLogoutProvider from "@/components/AutoLogoutProvider";
import Header from "@/components/Header";
import { MarketProvider } from "@/contexts/MarketContext";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BTC Exchange",
  description: "BTC/USDT 거래 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-gray-900 text-white min-h-screen">
        <AutoLogoutProvider>
          <MarketProvider>
            <Header />
            {children}
          </MarketProvider>
        </AutoLogoutProvider>
      </body>
    </html>
  );
}
