import { type ReactElement, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useI18n } from '@/core/i18n';
import { useFlashcardCatalog } from '@/core/api/flashcard-catalog.api';
import { MasteryBadge } from './MasteryBadge';
import { StatsSectionSkeleton } from './StatsSectionSkeleton';
import type { ModuleProgressVM, SubcategoryProgressVM } from '../stats.types';

interface SubcategoryProgressPanelProps {
  category: string;
  data: SubcategoryProgressVM[];
  moduleProgress: ModuleProgressVM | null;
  isLoading?: boolean;
  isError?: boolean;
  onBack: () => void;
  onRetry?: () => void;
  onPractice: (subcategory: string | null) => void;
  loadErrorLabel?: string;
  retryLabel?: string;
}

type ChartRow = SubcategoryProgressVM & { subcategoryLabel: string };

export const SubcategoryProgressPanel = ({
  category,
  data,
  moduleProgress,
  isLoading = false,
  isError = false,
  onBack,
  onRetry,
  onPractice,
  loadErrorLabel = 'Error',
  retryLabel = 'Retry',
}: SubcategoryProgressPanelProps): ReactElement => {
  const { t, locale } = useI18n();
  const st = t.stats;
  const { data: catalog } = useFlashcardCatalog();

  const filtered = useMemo(
    () => data.filter((row) => row.category === category),
    [category, data],
  );

  const chartData = useMemo<ChartRow[]>(() => {
    const categoryMeta = catalog?.categories.find((c) => c.value === category);
    return filtered.map((row) => {
      const subMeta = categoryMeta?.subcategories.find(
        (s) => s.value === row.subcategory,
      );
      return {
        ...row,
        subcategoryLabel: subMeta?.label[locale] ?? row.subcategory,
      };
    });
  }, [catalog, category, filtered, locale]);

  const categoryLabel =
    t.game.config.modules[category as keyof typeof t.game.config.modules] ??
    category;

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-sm text-[var(--color-accent-red)]">
          {loadErrorLabel}
        </p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-full border border-[var(--color-border-strong)] px-4 py-2 text-sm"
          >
            {retryLabel}
          </button>
        ) : null}
      </div>
    );
  }

  if (isLoading) {
    return <StatsSectionSkeleton />;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            {categoryLabel} {st.subcategoryTitleSuffix}
          </h2>
          {moduleProgress ? (
            <div className="mt-1 flex items-center gap-2">
              <MasteryBadge level={moduleProgress.masteryLevel} />
              <span className="text-xs text-[var(--color-text-muted)]">
                {moduleProgress.totalAttempts} intentos
              </span>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-[var(--color-brand)] hover:underline shrink-0"
        >
          {st.backToModules}
        </button>
      </div>

      {chartData.length === 0 ? (
        <p className="text-[var(--color-text-secondary)] text-sm text-center py-16">
          {st.noSubcategoryData}
        </p>
      ) : (
        <>
          <div className="mb-4 w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.08)"
                />
                <XAxis
                  dataKey="subcategoryLabel"
                  tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(v: number) => `${v}%`}
                  tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    color: 'var(--color-text-primary)',
                  }}
                  formatter={(value, _name, item) => {
                    const num =
                      typeof value === 'number' ? value : Number(value ?? 0);
                    const row = item.payload as ChartRow;
                    return [
                      `${num.toFixed(1)}% · ${row.totalAttempts} intentos`,
                      row.subcategoryLabel,
                    ];
                  }}
                />
                <Bar
                  dataKey="accuracy"
                  fill="var(--color-brand)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <button
            type="button"
            onClick={() => onPractice(null)}
            className="w-full rounded-full bg-[var(--color-brand)] py-2.5 text-sm font-semibold text-white"
          >
            {st.practice} — {categoryLabel}
          </button>
        </>
      )}
    </div>
  );
};
