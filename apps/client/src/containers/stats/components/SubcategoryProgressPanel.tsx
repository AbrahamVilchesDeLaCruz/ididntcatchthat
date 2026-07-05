import { type ReactElement, useMemo } from 'react';
import { useI18n } from '@/core/i18n';
import { useFlashcardCatalog } from '@/core/api/flashcard-catalog.api';
import { MasteryBadge } from './MasteryBadge';
import { AccuracyProgressBar } from './AccuracyProgressBar';
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

type SubcategoryRow = SubcategoryProgressVM & { subcategoryLabel: string };

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

  const rows = useMemo<SubcategoryRow[]>(() => {
    const categoryMeta = catalog?.categories.find((c) => c.value === category);
    return [...filtered]
      .map((row) => {
        const subMeta = categoryMeta?.subcategories.find(
          (s) => s.value === row.subcategory,
        );
        return {
          ...row,
          subcategoryLabel: subMeta?.label[locale] ?? row.subcategory,
        };
      })
      .sort((a, b) => b.accuracy - a.accuracy);
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
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-2 text-xs font-medium text-[var(--color-brand)] hover:underline"
          >
            {st.backToModules}
          </button>
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            {categoryLabel}
          </h2>
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
            {st.subcategoryHint}
          </p>
          {moduleProgress ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <MasteryBadge level={moduleProgress.masteryLevel} />
              <span className="text-xs text-[var(--color-text-muted)]">
                {st.attemptsLabel.replace(
                  '{count}',
                  String(moduleProgress.totalAttempts),
                )}
              </span>
              <span className="text-xs font-semibold tabular-nums text-[var(--color-text-secondary)]">
                {Math.round(moduleProgress.accuracy)}%
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="py-16 text-center text-sm text-[var(--color-text-secondary)]">
          {st.noSubcategoryData}
        </p>
      ) : (
        <>
          <ul className="mb-4 space-y-3">
            {rows.map((row) => (
              <li
                key={row.subcategory}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[var(--color-text-primary)]">
                      {row.subcategoryLabel}
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      {st.attemptsLabel.replace(
                        '{count}',
                        String(row.totalAttempts),
                      )}
                    </p>
                  </div>
                  <span className="shrink-0 text-xl font-bold tabular-nums text-[var(--color-text-primary)]">
                    {Math.round(row.accuracy)}%
                  </span>
                </div>
                <AccuracyProgressBar
                  value={row.accuracy}
                  className="mt-3"
                  ariaLabel={`${st.accuracy}: ${Math.round(row.accuracy)}%`}
                />
                <button
                  type="button"
                  onClick={() => onPractice(row.subcategory)}
                  className="mt-3 w-full rounded-full border border-[var(--color-border-strong)] py-2 text-xs font-semibold text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-brand-light)]"
                >
                  {st.practiceSubcategory.replace(
                    '{name}',
                    row.subcategoryLabel,
                  )}
                </button>
              </li>
            ))}
          </ul>
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
