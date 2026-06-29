import { type ReactElement } from 'react';
import { useI18n } from '@/core/i18n';

interface StudyLevelBadgeProps {
  level: number;
  className?: string;
}

const LEVEL_STYLES: Record<number, string> = {
  0: 'border-[var(--color-border)] text-[var(--color-text-muted)]',
  1: 'border-[var(--color-border-strong)] text-[var(--color-text-secondary)]',
  2: 'border-emerald-500/30 text-emerald-400',
  3: 'border-emerald-500/50 text-emerald-300 bg-emerald-500/10',
};

export const StudyLevelBadge = ({
  level,
  className = '',
}: StudyLevelBadgeProps): ReactElement => {
  const { t } = useI18n();
  const clamped = Math.max(0, Math.min(3, level));
  const labels = [
    t.stats.studyLevel.novice,
    t.stats.studyLevel.progressing,
    t.stats.studyLevel.solid,
    t.stats.studyLevel.explored,
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
