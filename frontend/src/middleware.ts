/**
 * Next.js Middleware — BFF 인증 처리
 * 배포환경 기획서 4-3 참고 (iron-session)
 */
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";

// 인증이 필요한 경로 패턴
const protectedPaths = ["/mypage", "/events/new", "/host", "/admin"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // 보호된 경로가 아니면 바로 통과
  const isProtected = protectedPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  if (!isProtected) {
    return res;
  }

  // iron-session에서 세션 복호화
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  if (!session.isLoggedIn) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 원본 JWT가 있으면 백엔드 전달을 위해 헤더에 설정
  if (session.jwt) {
    res.headers.set("Authorization", `Bearer ${session.jwt}`);
  }

  return res;
}

export const config = {
  matcher: ["/mypage/:path*", "/events/new", "/host/:path*", "/admin/:path*"],
};
