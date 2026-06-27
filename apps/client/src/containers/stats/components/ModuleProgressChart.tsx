import { type ReactElement, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { useI18n } from '@/core/i18n';
import { MasteryBadge } from './MasteryBadge';
import { AccuracyProgressBar } from './AccuracyProgressBar';
import type { ModuleProgressVM } from '../stats.types';
import type { GameModule } from '@/containers/game/api/game.api-model';

interface ModuleProgressChartProps {
  data: ModuleProgressVM[];
  onCategoryClick?: (category: string) => void;
}

type ModuleRow = ModuleProgressVM & { moduleLabel: string };

export const ModuleProgressChart = ({
  data,
  onCategoryClick,
}: ModuleProgressChartProps): ReactElement => {
  const { t } = useI18n();
  const st = t.stats;

  const rows = useMemo<ModuleRow[]>(
    () =>
      [...data]
        .map((row) => ({
          ...row,
          moduleLabel:
            t.game.config.modules[row.module as GameModule] ?? row.module,
        }))
        .sort((a, b) => b.accuracy - a.accuracy),
    [data, t],
  );

  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.module}>
          <button
            type="button"
            onClick={() => onCategoryClick?.(row.module)}
            className="group w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 text-left transition-colors hover:border-[var(--color-brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {row.moduleLabel}
                  </span>
                  <MasteryBadge level={row.masteryLevel} />
                </div>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  {st.attemptsLabel.replace(
                    '{count}',
                    String(row.totalAttempts),
                  )}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <span className="text-2xl font-bold tabular-nums text-[var(--color-text-primary)]">
                  {Math.round(row.accuracy)}%
                </span>
                <ChevronRight
                  aria-hidden
                  className="h-4 w-4 text-[var(--color-text-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-brand)]"
                />
              </div>
            </div>
            <AccuracyProgressBar value={row.accuracy} className="mt-3" />
          </button>
        </li>
      ))}
    </ul>
  );
};
