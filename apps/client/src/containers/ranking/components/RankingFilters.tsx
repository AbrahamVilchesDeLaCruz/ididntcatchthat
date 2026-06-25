import { type ReactElement } from 'react';
import { useI18n } from '@/core/i18n';
import type {
  RankingModule,
  RankingPeriod,
  RankingType,
} from '../ranking.types';

interface RankingFiltersProps {
  type: RankingType;
  period: RankingPeriod;
  module: RankingModule;
  onTypeChange: (type: RankingType) => void;
  onPeriodChange: (period: RankingPeriod) => void;
  onModuleChange: (module: RankingModule) => void;
}

const TYPES: RankingType[] = [
  'most_active',
  'most_accurate',
  'top_scorer',
  'best_streak',
  'module_master',
];

const PERIODS: RankingPeriod[] = ['weekly', 'monthly', 'all_time'];

const MODULES: RankingModule[] = [
  'native_sounds',
  'connected_speech',
  'flow_connectors',
  'real_talk',
];

const pillClass = (active: boolean): string =>
  [
    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
    active
      ? 'bg-[var(--color-brand)] text-white'
      : 'bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-brand)]/50',
  ].join(' ');

export const RankingFilters = ({
  type,
  period,
  module,
  onTypeChange,
  onPeriodChange,
  onModuleChange,
}: RankingFiltersProps): ReactElement => {
  const { t } = useI18n();
  const r = t.ranking;
  const showPeriod = type !== 'best_streak' && type !== 'module_master';

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
          {r.filters.type}
        </p>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={type === value}
              onClick={() => onTypeChange(value)}
              className={pillClass(type === value)}
            >
              {r.types[value]}
            </button>
          ))}
        </div>
      </div>

      {showPeriod && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
            {r.filters.period}
          </p>
          <div className="flex flex-wrap gap-2">
            {PERIODS.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={period === value}
                onClick={() => onPeriodChange(value)}
                className={pillClass(period === value)}
              >
                {r.periods[value]}
              </button>
            ))}
          </div>
        </div>
      )}

      {!showPeriod && (
        <p className="text-xs text-[var(--color-text-muted)]">
          {r.periodIgnoredHint}
        </p>
      )}

      {type === 'module_master' && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
            {r.filters.module}
          </p>
          <div className="flex flex-wrap gap-2">
            {MODULES.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={module === value}
                onClick={() => onModuleChange(value)}
                className={pillClass(module === value)}
              >
                {t.game.config.modules[value]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
