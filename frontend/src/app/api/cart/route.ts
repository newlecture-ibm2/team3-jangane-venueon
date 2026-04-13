import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/session";

const API_BASE = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * BFF Route Handler for Cart
 * - Proxies to backend
 * - Unwraps ApiResponse
 */
export async function GET() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.jwt) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${API_BASE}/cart`, {
      headers: {
        "Authorization": `Bearer ${session.jwt}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 0 }, // Disable caching
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Backend request failed" }, { status: res.status });
    }

    const wrapper = await res.json();
    
    // ApiResponse wrapper: { success: boolean, message: string, data: T }
    return NextResponse.json(wrapper.data || []);
  } catch (error) {
    console.error("Cart BFF Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.jwt) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const res = await fetch(`${API_BASE}/cart`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      const errorMessage = errorBody?.message || "Failed to add to cart";
      return NextResponse.json({ error: errorMessage }, { status: res.status });
    }

    const wrapper = await res.json();
    return NextResponse.json(wrapper.data);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * Note: For DELETE /cart/{id}, we might need a dynamic route: api/cart/[id]/route.ts
 * But for clearing all (DELETE /cart), we can put it here.
 */
export async function DELETE(req: NextRequest) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.jwt) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${API_BASE}/cart`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${session.jwt}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to clear cart" }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
