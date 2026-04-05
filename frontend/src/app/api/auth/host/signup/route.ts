import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const API_BASE = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

    const res = await fetch(`${API_BASE}/auth/host/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Host Signup API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
