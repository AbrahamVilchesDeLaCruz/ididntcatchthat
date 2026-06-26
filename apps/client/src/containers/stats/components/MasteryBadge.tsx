import { type ReactElement } from 'react';
import { useI18n } from '@/core/i18n';

interface MasteryBadgeProps {
  level: number;
  className?: string;
}

const LEVEL_STYLES: Record<number, string> = {
  0: 'border-[var(--color-border)] text-[var(--color-text-muted)]',
  1: 'border-[var(--color-border-strong)] text-[var(--color-text-secondary)]',
  2: 'border-[var(--color-brand-dim)] text-[var(--color-brand-light)]',
  3: 'border-[var(--color-brand)] text-[var(--color-brand-light)] bg-[var(--color-brand-dim)]',
};

export const MasteryBadge = ({
  level,
  className = '',
}: MasteryBadgeProps): ReactElement => {
  const { t } = useI18n();
  const clamped = Math.max(0, Math.min(3, level));
  const labels = [
    t.stats.mastery.novice,
    t.stats.mastery.progressing,
    t.stats.mastery.solid,
    t.stats.mastery.mastered,
  ];

  return (
    <span
      className={[
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        LEVEL_STYLES[clamped] ?? LEVEL_STYLES[0],
        className,
      ].join(' ')}
    >
      {labels[clamped]}
    </span>
  );
};
