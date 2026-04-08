import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/session";

const API_BASE = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ cartId: string }> }
) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.jwt) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cartId } = await params;

  try {
    const body = await req.json();
    const res = await fetch(`${API_BASE}/cart/${cartId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${session.jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to update quantity" }, { status: res.status });
    }

    const wrapper = await res.json();
    return NextResponse.json(wrapper.data);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ cartId: string }> }
) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.jwt) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cartId } = await params;

  try {
    const res = await fetch(`${API_BASE}/cart/${cartId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${session.jwt}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to delete item" }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
