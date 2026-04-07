/**
 * 호스트 전용 API 클라이언트 — `/api/*` BFF 경로만 사용
 * iron-session JWT를 `Authorization`에 붙여 백엔드로 프록시 (`app/api/[...path]/route.ts`).
 * 공용 `api.ts`(`/v1` rewrite)는 JWT가 전달되지 않을 수 있어 호스트 화면에서만 이 모듈을 씁니다.
 */

const API_BASE = "/api";

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

export async function hostApiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_BASE}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
    credentials: "include",
    ...fetchOptions,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "요청 실패" }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export const hostApi = {
  get: <T>(endpoint: string, options?: FetchOptions) =>
    hostApiFetch<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    hostApiFetch<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    hostApiFetch<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    hostApiFetch<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: FetchOptions) =>
    hostApiFetch<T>(endpoint, { ...options, method: "DELETE" }),
};
