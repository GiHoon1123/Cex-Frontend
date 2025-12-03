import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://52.79.139.149:3002';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'DELETE');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'PATCH');
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    // 경로 구성: /api/proxy/auth/signup -> /api/auth/signup
    const apiPath = `/api/${pathSegments.join('/')}`;
    const url = new URL(apiPath, BACKEND_URL);
    
    // 쿼리 파라미터 추가
    request.nextUrl.searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    // 요청 본문 가져오기
    let body: string | undefined;
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        body = await request.text();
      } catch {
        body = undefined;
      }
    }

    // 헤더 복사 (Authorization 등)
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      // Next.js 내부 헤더는 제외
      if (!key.startsWith('x-') && key !== 'host' && key !== 'connection') {
        headers[key] = value;
      }
    });

    // 백엔드로 프록시 요청
    const response = await fetch(url.toString(), {
      method,
      headers,
      body,
    });

    // 응답 데이터 가져오기
    const data = await response.text();
    
    // JSON 파싱 시도
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch {
      jsonData = data;
    }

    // 응답 반환
    return NextResponse.json(jsonData, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('[API Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Proxy request failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

