export const hostAPI = {
  getProfile: async () => {
    const res = await fetch('/api/host/profile');
    const result = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(result.message || result.error || '프로필 연동에 실패했습니다.');
    return result.data;
  },

  updateProfile: async (data: { orgName: string; managerName: string; orgDescription?: string; profileImg?: string }) => {
    const res = await fetch('/api/host/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(result.message || result.error || '프로필 수정에 실패했습니다.');
    return result.data;
  },
};
