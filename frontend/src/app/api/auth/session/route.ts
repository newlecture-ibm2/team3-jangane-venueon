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
      },
    });
  } else {
    return NextResponse.json({ isLoggedIn: false });
  }
}
