export const authAPI = {
  signup: async (data: any) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(result.message || result.error || '회원가입 실패');
    return result;
  },
  login: async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(result.message || result.error || '로그인 실패');
    return result;
  },
  logout: async () => {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    return res.json().catch(() => ({}));
  },
  getSession: async () => {
    const res = await fetch('/api/auth/session');
    return res.json().catch(() => ({ isLoggedIn: false }));
  },
};
