import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/session";

// ✅ 환경 변수: 런타임 변수(API_BASE_URL)를 우선 참조합니다.
const API_BASE = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function proxyRequest(req: NextRequest) {
  // 요청 경로 및 쿼리 파라미터 추출
  const path = req.nextUrl.pathname;
  const search = req.nextUrl.search;

  // /api 접두사를 제거하고 백엔드로 전달
  // 예: /api/menus → /menus
  const backendPath = path.replace(/^\/api/, "");
  const targetUrl = `${API_BASE}${backendPath}${search}`;

  // ✅ 필수 헤더만 명시적으로 구성
  const headers: Record<string, string> = {};

  const contentType = req.headers.get("content-type");
  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  const accept = req.headers.get("accept");
  if (accept) {
    headers["Accept"] = accept;
  }

  // ✅ BFF 세션에 JWT가 있다면 Authorization 헤더 주입
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (session.jwt) {
    headers["Authorization"] = `Bearer ${session.jwt}`;
  }

  // ✅ 모든 API 호출 시 User ID 및 Role 헤더 전달 (백엔드 인증용)
  const userId = session.userId || 2; // 임시 기본값 (로그인 연동 전용)
  let userRoleStr = "USER";
  if (session.role?.id === 1) userRoleStr = "ADMIN";
  else if (session.role?.id === 3) userRoleStr = "HOST";
  
  headers["X-User-Id"] = userId.toString();
  headers["X-Host-Id"] = userId.toString();
  headers["X-User-Role"] = userRoleStr;

  // ✅ 요청 본문(Body) 안전하게 전달
  let body: BodyInit | null | undefined = undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    if (contentType?.includes("multipart/form-data")) {
      // 멀티파트: FormData로 재파싱하여 전달 (boundary 자동 생성)
      // Content-Type 헤더를 제거하여 fetch가 올바른 boundary를 설정하도록 함
      const formData = await req.formData();
      const newFormData = new FormData();
      for (const [key, value] of formData.entries()) {
        newFormData.append(key, value);
      }
      body = newFormData;
      delete headers["Content-Type"]; // fetch가 multipart boundary를 자동 설정
    } else {
      // JSON 형태는 텍스트로 읽어서 전달
      body = await req.text();
    }
  }

  try {
    const proxyRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      // 백엔드 에러 및 리디렉션을 그대로 클라이언트에 전달하기 위함
      redirect: "manual",
    });

    console.log(`[PROXY] ${req.method} ${targetUrl} -> status: ${proxyRes.status}, hasJwt: ${!!session.jwt}`);

    // 백엔드 요청에서 401(Unauthorized) 응답 시, 만료된 JWT 세션 파기
    if (proxyRes.status === 401 && session.jwt) {
      session.destroy();
    }

    // 서버의 응답 헤더 중 Content-Type을 클라이언트로 반환
    const responseHeaders = new Headers();
    const resContentType = proxyRes.headers.get("content-type");
    if (resContentType) {
      responseHeaders.set("Content-Type", resContentType);
    }

    return new NextResponse(proxyRes.body, {
      status: proxyRes.status,
      statusText: proxyRes.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
export const PATCH = proxyRequest;
export const OPTIONS = proxyRequest;
