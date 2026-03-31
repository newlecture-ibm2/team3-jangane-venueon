import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/session";

const SPRING_BOOT_URL = process.env.NEXT_PUBLIC_API_URL || "http://venueon-backend:8080";

async function proxyHandler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  // Next.js 15+ 에서는 params가 Promise이므로 await 처리
  const resolvedParams = await params;
  const pathArray = resolvedParams.path || [];
  const joinedPath = pathArray.join("/");

  // /api/* -> /api 제거하고 Spring Boot로 전달
  let targetUrl = `${SPRING_BOOT_URL}/${joinedPath}`;

  // 쿼리 파라미터 복사
  const url = new URL(req.url);
  const searchParams = url.searchParams.toString();
  if (searchParams) {
    targetUrl += `?${searchParams}`;
  }

  // 헤더 설정 (호스트 헤더 제외)
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "host" && key.toLowerCase() !== "connection") {
      headers.set(key, value);
    }
  });

  // BFF: JWT 세션에서 토큰 자동 주입
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (session.jwt) {
    headers.set("Authorization", `Bearer ${session.jwt}`);
  }

  try {
    const body = req.method !== "GET" && req.method !== "HEAD" ? await req.blob() : undefined;

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      // 백엔드 에러 및 리디렉션을 클라이언트에게 그대로 전달
      redirect: "manual",
    });

    return new NextResponse(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export const GET = proxyHandler;
export const POST = proxyHandler;
export const PUT = proxyHandler;
export const PATCH = proxyHandler;
export const DELETE = proxyHandler;
export const OPTIONS = proxyHandler;
