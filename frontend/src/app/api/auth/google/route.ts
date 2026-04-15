import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/session";
import { NextResponse } from "next/server";

/**
 * POST /api/auth/google — 구글 소셜 로그인 BFF
 * 1. 프론트엔드에서 Google ID Token 수신
 * 2. Spring Boot /auth/google 로 전달 → JWT + 사용자정보 반환
 * 3. iron-session에 저장 후 클라이언트에 사용자정보 전달
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const API_BASE = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

    // 1. Spring Boot Google 로그인 엔드포인트 호출
    const googleRes = await fetch(`${API_BASE}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: body.idToken }),
    });

    if (!googleRes.ok) {
      const error = await googleRes.json().catch(() => ({}));
      return NextResponse.json(error, { status: googleRes.status });
    }

    const loginData = await googleRes.json();

    // 2. JWT로 사용자 정보 조회
    const meRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${loginData.token}` },
    });

    const userData = meRes.ok ? await meRes.json() : loginData;

    // 3. iron-session에 JWT + 사용자 정보 저장
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    session.jwt = loginData.token;
    session.email = userData.email;
    session.nickname = userData.nickname;
    session.profileImg = userData.profileImg;
    session.role = userData.role;
    session.userId = userData.id;
    session.provider = userData.provider || 'GOOGLE';
    session.isLoggedIn = true;
    await session.save();

    // 4. 브라우저에겐 JWT 없이 사용자 정보만 반환
    return NextResponse.json({
      user: {
        id: userData.id,
        email: userData.email,
        nickname: userData.nickname,
        role: userData.role,
        profileImg: userData.profileImg,
      },
      success: true,
    });
  } catch (error) {
    console.error("Google Login API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
