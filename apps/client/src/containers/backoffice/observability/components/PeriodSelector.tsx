import { type ReactElement } from 'react';
import { useI18n } from '@/core/i18n';

export type SummaryPeriod = '24h' | '7d' | '15d' | '30d' | '6m' | 'all';

const PERIODS: SummaryPeriod[] = ['24h', '7d', '15d', '30d', '6m', 'all'];

interface PeriodSelectorProps {
  value: SummaryPeriod;
  onChange: (period: SummaryPeriod) => void;
}

export const PeriodSelector = ({
  value,
  onChange,
}: PeriodSelectorProps): ReactElement => {
  const { t } = useI18n();

  return (
    <div className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-0.5">
      {PERIODS.map((key) => (
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
          {t.backoffice.period[key]}
        </button>
      ))}
    </div>
  );
};
