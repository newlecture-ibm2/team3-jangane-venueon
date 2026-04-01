import { create } from 'zustand';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

interface ToastState {
  isToastOpen: boolean;
  toastMessage: string;
  toastType: ToastType;
}

interface UIStore extends ToastState {
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isToastOpen: false,
  toastMessage: '',
  toastType: 'info',
  showToast: (message, type = 'info') => {
    set({
      isToastOpen: true,
      toastMessage: message,
      toastType: type,
    });

    // 3초 뒤 자동 닫힘 처리
    setTimeout(() => {
      set({ isToastOpen: false });
    }, 3000);
  },
  hideToast: () => set({ isToastOpen: false }),
}));
