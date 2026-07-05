import { type ReactElement } from 'react';
import { BookOpen, Flame, Gamepad2, Layers, Trophy, X } from 'lucide-react';
import type { AchievementCategory } from '@/core/achievements/achievement.types';
import { useI18n } from '@/core/i18n';
import { useToastStore } from './toast.store';

const categoryIcon: Record<AchievementCategory, typeof Gamepad2> = {
  game: Gamepad2,
  streak: Flame,
  module: Layers,
  study: BookOpen,
};

export const ToastHost = (): ReactElement | null => {
  const { t } = useI18n();
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2"
    >
      {toasts.map((toast) => {
        const CategoryIcon = toast.category
          ? categoryIcon[toast.category]
          : Trophy;
        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 rounded-xl border border-[var(--color-brand-dim)] bg-[var(--color-bg-card)] p-4 shadow-lg"
            role="status"
          >
            <CategoryIcon
              aria-hidden
              className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-brand)]"
            />
            <p className="flex-1 text-sm text-[var(--color-text-primary)]">
              {toast.message}
            </p>
            <button
              type="button"
              aria-label={t.common.dismiss}
              className="shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              onClick={() => {
                dismiss(toast.id);
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
