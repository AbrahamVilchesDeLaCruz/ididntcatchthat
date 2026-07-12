import { create } from 'zustand';
import type { AchievementCategory } from '@/core/achievements/achievement.types';

export interface ToastItem {
  id: string;
  message: string;
  category?: AchievementCategory;
  /**
   * Identificador opcional para deduplicar toasts. Si dos `push` usan el
   * mismo `key` mientras el primero sigue vivo en el store, el segundo se
   * descarta. Útil cuando el mismo achievement se detecta desde dos paths
   * (p.ej. optimista + poll del backend) y no queremos mostrarlo dos veces.
   */
  key?: string;
}

interface ToastState {
  toasts: ToastItem[];
  push: (toast: Omit<ToastItem, 'id'>) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) => {
    if (toast.key) {
      const existing = useToastStore
        .getState()
        .toasts.find((t) => t.key === toast.key);
      if (existing) return;
    }
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
