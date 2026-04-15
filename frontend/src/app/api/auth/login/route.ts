import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const API_BASE = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

    // 1. Spring Boot에 로그인 요청
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!loginRes.ok) {
      const error = await loginRes.json().catch(() => ({}));
      return NextResponse.json(error, { status: loginRes.status });
    }

    const loginData = await loginRes.json();
    
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
    session.provider = userData.provider || 'LOCAL';
    session.isLoggedIn = true;
    await session.save();

    // 4. 브라우저에겐 JWT 없이 사용자 정보만 반환
    return NextResponse.json({
      user: {
        id: userData.id,
        email: userData.email,
        nickname: userData.nickname,
        role: userData.role, // { id: number, label: string }
      },
      tempPassword: loginData.tempPassword || false,
      success: true
    });
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
