/**
 * iron-session 설정 — BFF 세션 쿠키 관리
 * 배포환경 기획서 4-3 참고
 */
import type { SessionOptions } from "iron-session";

export interface SessionData {
  jwt?: string;
  userId?: number;
  email?: string;
  nickname?: string;
  profileImg?: string;
  role?: "ADMIN" | "HOST" | "USER";
  isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
  isLoggedIn: false,
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || "default-dev-secret-must-be-32-chars-long!",
  cookieName: "venueon_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
  },
};
