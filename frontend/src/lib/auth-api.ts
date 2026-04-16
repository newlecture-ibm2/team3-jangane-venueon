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
  hostSignup: async (data: any) => {
    const res = await fetch('/api/auth/host/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(result.message || result.error || '호스트 가입 실패');
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
  googleLogin: async (idToken: string) => {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(result.message || result.error || '구글 로그인 실패');
    return result;
  },
  upgradeToHost: async (data: {
    managerName: string;
    orgName: string;
    orgNumber: string;
    orgDescription?: string;
  }) => {
    const res = await fetch('/api/auth/host/upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(result.message || result.error || '호스트 가입 처리에 실패했습니다.');
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
  /** 임시 비밀번호 요청 (forgot-password) */
  requestTempPassword: async (email: string) => {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(result.message || '요청에 실패했습니다.');
    return result;
  },
  /** 비밀번호 변경 (reset-password) */
  changePassword: async (newPassword: string) => {
    const res = await fetch('/api/users/me/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: '', newPassword }),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(result.message || '비밀번호 변경에 실패했습니다.');
    return result;
  },
  /** 이메일 인증 (verify-email) */
  verifyEmail: async (token: string) => {
    const res = await fetch(`/api/auth/verify-email?token=${token}`);
    const result = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(result.message || '인증에 실패했습니다.');
    return result;
  },
};
