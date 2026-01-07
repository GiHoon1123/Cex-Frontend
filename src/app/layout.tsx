import AutoLogoutProvider from "@/components/AutoLogoutProvider";
import Header from "@/components/Header";
import RateLimitHandler from "@/components/RateLimitHandler";
import ServerMaintenanceBanner from "@/components/ServerMaintenanceBanner";
import { SolPriceProvider } from "@/contexts/SolPriceContext";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solana Exchange",
  description: "Solana blockchain trading platform",
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
          <SolPriceProvider>
            <RateLimitHandler />
            <ServerMaintenanceBanner />
            <Header />
            {children}
          </SolPriceProvider>
        </AutoLogoutProvider>
      </body>
    </html>
  );
}
