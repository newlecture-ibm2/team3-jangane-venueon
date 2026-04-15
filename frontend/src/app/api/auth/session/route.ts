import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (session.isLoggedIn) {
    return NextResponse.json({
      isLoggedIn: true,
      user: {
        id: session.userId,
        email: session.email,
        nickname: session.nickname,
        profileImg: session.profileImg,
        role: session.role,
        provider: session.provider || 'LOCAL',
      },
    });
  } else {
    return NextResponse.json({ isLoggedIn: false });
  }
}

/**
 * PUT /api/auth/session — 프로필 수정 후 세션 쿠키 동기화
 * nickname, profileImg 를 iron-session에 갱신하여 새로고침 후에도 최신 값 유지
 */
export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // 전달된 필드만 업데이트
    if (body.nickname !== undefined) {
      session.nickname = body.nickname;
    }
    if (body.profileImg !== undefined) {
      session.profileImg = body.profileImg || undefined;
    }

    await session.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Session update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
