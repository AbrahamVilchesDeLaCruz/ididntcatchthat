import { create } from 'zustand';
import type { AchievementCategory } from '@/core/achievements/achievement.types';

export interface ToastItem {
  id: string;
  message: string;
  category?: AchievementCategory;
}

interface ToastState {
  toasts: ToastItem[];
  push: (toast: Omit<ToastItem, 'id'>) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = crypto.randomUUID();
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    window.setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((item) => item.id !== id),
      }));
    }, 5000);
  },
  dismiss: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((item) => item.id !== id),
    }));
  },
}));
