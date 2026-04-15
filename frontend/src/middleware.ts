/**
 * Next.js Middleware — BFF 인증 처리
 * 배포환경 기획서 4-3 참고 (iron-session)
 */
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";

// 인증이 필요한 경로 패턴 (상세 페이지 제외)
const protectedPaths = ["/mypage", "/events/new", "/host", "/admin", "/cart"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const { pathname } = req.nextUrl;

  // 보호된 경로 여부 확인
  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (!isProtected) {
    return res;
  }

  // iron-session에서 세션 복호화
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  if (!session.isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    loginUrl.searchParams.set("alert", "auth_required");
    return NextResponse.redirect(loginUrl);
  }

  // 관리자 권한이 필요한 경로의 권한 체크
  if (pathname.startsWith("/admin") && session.role?.id !== 1) {
    // 권한이 없으면 메인 페이지로 리다이렉트
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 원본 JWT가 있으면 백엔드 전달을 위해 헤더에 설정
  if (session.jwt) {
    res.headers.set("Authorization", `Bearer ${session.jwt}`);
  }

  return res;
}

export const config = {
  matcher: [
    "/mypage/:path*", 
    "/events/new", 
    "/host", 
    "/host/:path*", 
    "/admin/:path*", 
    "/cart", 
    "/cart/:path*"
  ],
};
