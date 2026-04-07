import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from '@/lib/session';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(`${BACKEND_URL}/events/${id}`);
    const data = await response.json();

    if (!response.ok) {
        return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching event details:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    const userId = session.userId || 5;
    const userRole = session.role || 'HOST';

    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/host/events/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": userId.toString(),
        "X-User-Role": userRole,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to update event:", error);
    return NextResponse.json(
      { success: false, message: "이벤트 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    const userId = session.userId || 5;
    const userRole = session.role || 'HOST';

    const response = await fetch(`${BACKEND_URL}/host/events/${id}`, {
      method: "DELETE",
      headers: {
        "X-User-Id": userId.toString(),
        "X-User-Role": userRole,
      },
    });

    if (!response.ok) {
      if (response.status !== 204) {
        const errorData = await response.json();
        return NextResponse.json(errorData, { status: response.status });
      }
    }

    return NextResponse.json({ success: true, message: "이벤트가 삭제되었습니다." });
  } catch (error) {
    console.error("Failed to delete event:", error);
    return NextResponse.json(
      { success: false, message: "이벤트 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
