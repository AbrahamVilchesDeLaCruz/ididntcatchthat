import { type ReactElement } from 'react';

export type SummaryPeriod = '24h' | '7d' | '15d' | '30d' | '6m' | 'all';

const PERIODS: { key: SummaryPeriod; label: string }[] = [
  { key: '24h', label: '24 h' },
  { key: '7d', label: '7 días' },
  { key: '15d', label: '15 días' },
  { key: '30d', label: '30 días' },
  { key: '6m', label: '6 meses' },
  { key: 'all', label: 'Total' },
];

interface PeriodSelectorProps {
  value: SummaryPeriod;
  onChange: (period: SummaryPeriod) => void;
}

export const PeriodSelector = ({
  value,
  onChange,
}: PeriodSelectorProps): ReactElement => (
  <div className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-0.5">
    {PERIODS.map(({ key, label }) => (
      <button
        key={key}
        type="button"
        onClick={() => {
          onChange(key);
        }}
        className={[
          'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
          value === key
            ? 'bg-[var(--color-brand)] text-white shadow-sm'
            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card)]',
        ].join(' ')}
      >
        {label}
      </button>
    ))}
  </div>
);
