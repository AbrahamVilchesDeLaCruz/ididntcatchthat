import { type ReactElement } from 'react';

export type InsightVariant = 'success' | 'warning' | 'danger' | 'neutral';

export interface InsightCardProps {
  label: string;
  value: string;
  insight: string;
  variant?: InsightVariant;
  progress?: number;
  sub?: string;
}

const VARIANT: Record<
  InsightVariant,
  { dot: string; value: string; insight: string; bar: string }
> = {
  success: {
    dot: 'bg-[var(--color-accent-green)]',
    value: 'text-[var(--color-accent-green)]',
    insight: 'text-[var(--color-text-secondary)]',
    bar: 'bg-[var(--color-accent-green)]',
  },
  warning: {
    dot: 'bg-[var(--color-brand)]',
    value: 'text-[var(--color-brand)]',
    insight: 'text-[var(--color-text-secondary)]',
    bar: 'bg-[var(--color-brand)]',
  },
  danger: {
    dot: 'bg-[var(--color-accent-red)]',
    value: 'text-[var(--color-accent-red)]',
    insight: 'text-[var(--color-text-secondary)]',
    bar: 'bg-[var(--color-accent-red)]',
  },
  neutral: {
    dot: 'bg-[var(--color-text-muted)]',
    value: 'text-[var(--color-text-primary)]',
    insight: 'text-[var(--color-text-secondary)]',
    bar: 'bg-[var(--color-text-muted)]',
  },
};

export const InsightCard = ({
  label,
  value,
  insight,
  variant = 'neutral',
  progress,
  sub,
}: InsightCardProps): ReactElement => {
  const v = VARIANT[variant];
  return (
    <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[var(--color-text-secondary)] text-xs font-medium uppercase tracking-wide">
          {label}
        </p>
        <span className={`w-2 h-2 rounded-full shrink-0 ${v.dot}`} />
      </div>

      <p
        className={`text-2xl font-bold tracking-tight leading-none ${v.value}`}
      >
        {value}
      </p>

      {progress !== undefined && (
        <div className="h-1.5 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${v.bar}`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}

      <p className={`text-xs leading-relaxed ${v.insight}`}>{insight}</p>

      {sub && <p className="text-xs text-[var(--color-text-muted)]">{sub}</p>}
    </div>
  );
};

export const InsightCardSkeleton = (): ReactElement => (
  <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-5 animate-pulse flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <div className="h-3 w-24 bg-[var(--color-bg-elevated)] rounded" />
      <div className="w-2 h-2 rounded-full bg-[var(--color-bg-elevated)]" />
    </div>
    <div className="h-7 w-20 bg-[var(--color-bg-elevated)] rounded" />
    <div className="h-1.5 rounded-full bg-[var(--color-bg-elevated)]" />
    <div className="h-3 w-full bg-[var(--color-bg-elevated)] rounded" />
  </div>
);
