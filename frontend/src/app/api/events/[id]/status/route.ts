import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const status = body.status;

    // 세션에서 userId 추출
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    const userId = String(session.userId || 5);

    // role 객체에서 id 확인 후 X-User-Role 설정 (1: ADMIN, 3: HOST, 그 외 사용자)
    let userRoleStr = "HOST";
    if (session.role?.id === 1) userRoleStr = "ADMIN";
    else if (session.role?.id === 2) userRoleStr = "USER";

    const response = await fetch(
      `${API_BASE_URL}/host/events/${id}/status?status=${status}`,
      {
        method: "PATCH",
        headers: {
          "X-User-Id": userId,
          "X-User-Role": userRoleStr,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Failed to update event status:", error);
    return NextResponse.json(
      { success: false, message: "상태 변경에 실패했습니다.", data: null },
      { status: 500 }
    );
  }
}
