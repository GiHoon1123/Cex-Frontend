import type {Metadata} from 'next';
import './globals.css';

export const metadata:Metadata={title:'CEX 운영자',description:'거래소 운영 통제 화면'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="ko"><body>{children}</body></html>;}
