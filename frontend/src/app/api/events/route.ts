import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/session";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryStr = searchParams.toString();

    const response = await fetch(`${API_BASE_URL}/events?${queryStr}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 } // 캐싱 옵션 (필요시 조절)
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        errorData,
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch events from backend:", error);
    console.error("Failed to fetch events from backend:", error);
    return NextResponse.json(
      { status: "ERROR", message: "Failed to fetch events: " + (error instanceof Error ? error.message : String(error)), data: null },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    // 임시로 로그인 안된 경우 테스트용 5번 유저 (추후 수정)
    const userId = session.userId || 5;

    const body = await request.json();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-User-Id": userId.toString()
    };
    if (session.jwt) {
      headers["Authorization"] = `Bearer ${session.jwt}`;
    }

    const response = await fetch(`${API_BASE_URL}/host/events`, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Failed to create event:", error);
    console.error("Failed to create event:", error);
    return NextResponse.json(
      { status: "ERROR", message: "Failed to create event: " + (error instanceof Error ? error.message : String(error)), data: null },
      { status: 500 }
    );
  }
}

