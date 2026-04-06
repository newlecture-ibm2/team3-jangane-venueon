import { NextRequest, NextResponse } from "next/server";

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
    return NextResponse.json(
      { status: "ERROR", message: "Failed to fetch events", data: null },
      { status: 500 }
    );
  }
}
