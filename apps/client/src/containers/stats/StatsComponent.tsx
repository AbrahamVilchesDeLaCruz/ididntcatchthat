import { type ReactElement, useMemo } from 'react';
import { useI18n } from '@/core/i18n';
import { StatsHero } from './components/StatsHero';
import { StatsAchievements } from './components/StatsAchievements';
import { ModuleProgressChart } from './components/ModuleProgressChart';
import { SubcategoryProgressPanel } from './components/SubcategoryProgressPanel';
import { WeakFlashcardsTable } from './components/WeakFlashcardsTable';
import { StatsSectionSkeleton } from './components/StatsSectionSkeleton';
import type {
  AchievementVM,
  ModuleProgressVM,
  ProgressSummaryVM,
  SubcategoryProgressVM,
  WeakFlashcardVM,
} from './stats.types';

interface StatsComponentProps {
  summary: ProgressSummaryVM | null;
  summaryLoading: boolean;
  summaryError: boolean;
  achievements: AchievementVM[];
  achievementsLoading: boolean;
  modules: ModuleProgressVM[];
  subcategories: SubcategoryProgressVM[];
  weakFlashcards: WeakFlashcardVM[];
  selectedCategory: string | null;
  moduleLoading: boolean;
  moduleError: boolean;
  subcategoryLoading: boolean;
  subcategoryError: boolean;
  weakLoading: boolean;
  weakError: boolean;
  isGuest: boolean;
  onCategorySelect: (category: string) => void;
  onCategoryClear: () => void;
  onRetryModules: () => void;
  onRetrySubcategories: () => void;
  onRetryWeak: () => void;
  onRetrySummary: () => void;
  onPractice: (module: string, subcategory: string | null) => void;
  onPracticeWeakest: () => void;
  onGuestRegister: () => void;
  emptyGlobalCta: () => void;
  loadErrorLabel: string;
  retryLabel: string;
}

const SectionError = ({
  message,
  retryLabel,
  onRetry,
}: {
  message: string;
  retryLabel: string;
  onRetry: () => void;
}): ReactElement => (
  <div className="flex flex-col items-center gap-3 py-12 text-center">
    <p className="text-sm text-[var(--color-accent-red)]">{message}</p>
    <button
      type="button"
      onClick={onRetry}
      className="rounded-full border border-[var(--color-border-strong)] px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:border-[var(--color-brand)]"
    >
      {retryLabel}
    </button>
  </div>
);

export const StatsComponent = ({
  summary,
  summaryLoading,
  summaryError,
  achievements,
  achievementsLoading,
  modules,
  subcategories,
  weakFlashcards,
  selectedCategory,
  moduleLoading,
  moduleError,
  subcategoryLoading,
  subcategoryError,
  weakLoading,
  weakError,
  isGuest,
  onCategorySelect,
  onCategoryClear,
  onRetryModules,
  onRetrySubcategories,
  onRetryWeak,
  onRetrySummary,
  onPractice,
  onPracticeWeakest,
  onGuestRegister,
  emptyGlobalCta,
  loadErrorLabel,
  retryLabel,
}: StatsComponentProps): ReactElement => {
  const { t } = useI18n();
  const st = t.stats;

  const filteredWeak = useMemo(() => {
    if (!selectedCategory) return weakFlashcards;
    return weakFlashcards.filter((w) => w.category === selectedCategory);
  }, [selectedCategory, weakFlashcards]);

  const selectedModuleProgress = useMemo(
    () => modules.find((m) => m.module === selectedCategory) ?? null,
    [modules, selectedCategory],
  );

  if (modules.length === 0 && !moduleLoading && !moduleError && !isGuest) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          {st.emptyGlobalTitle}
        </h1>
        <p className="max-w-md text-sm text-[var(--color-text-secondary)]">
          {st.emptyGlobalBody}
        </p>
        <button
          type="button"
          onClick={emptyGlobalCta}
          className="rounded-full bg-[var(--color-brand)] px-6 py-3 text-sm font-semibold text-white"
        >
          {st.emptyGlobalCta}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          {st.title}
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm mt-1">
          {st.subtitle}
        </p>
      </div>

      {summaryError ? (
        <SectionError
          message={loadErrorLabel}
          retryLabel={retryLabel}
          onRetry={onRetrySummary}
        />
      ) : summaryLoading || !summary ? (
        <StatsSectionSkeleton height="h-24" />
      ) : (
        <StatsHero summary={summary} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--color-bg-card)] rounded-xl p-6 border border-[var(--color-border)]">
          {moduleError ? (
            <SectionError
              message={loadErrorLabel}
              retryLabel={retryLabel}
              onRetry={onRetryModules}
            />
          ) : moduleLoading ? (
            <StatsSectionSkeleton />
          ) : selectedCategory === null ? (
            <>
              <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
                {st.moduleChartTitle}
              </h2>
              <p className="mb-4 text-xs text-[var(--color-text-muted)]">
                {st.moduleChartHint}
              </p>
              {modules.length === 0 ? (
                <p className="text-[var(--color-text-secondary)] text-sm text-center py-16">
                  {st.noModuleData}
                </p>
              ) : (
                <ModuleProgressChart
                  data={modules}
                  onCategoryClick={onCategorySelect}
                />
              )}
            </>
          ) : (
            <SubcategoryProgressPanel
              category={selectedCategory}
              data={subcategories}
              moduleProgress={selectedModuleProgress}
              isLoading={subcategoryLoading}
              isError={subcategoryError}
              onBack={onCategoryClear}
              onRetry={onRetrySubcategories}
              onPractice={(subcategory) =>
                onPractice(selectedCategory, subcategory)
              }
              loadErrorLabel={loadErrorLabel}
              retryLabel={retryLabel}
            />
          )}
        </div>

        <div className="bg-[var(--color-bg-card)] rounded-xl p-6 border border-[var(--color-border)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
              {st.weakTableTitle}
            </h2>
            {summary && summary.weakCount > 0 ? (
              <button
                type="button"
                onClick={isGuest ? onGuestRegister : onPracticeWeakest}
                className="rounded-full bg-[var(--color-brand)] px-4 py-2 text-xs font-semibold text-white"
              >
                {isGuest
                  ? st.weakestGuestCta
                  : st.weakestCta.replace('{count}', String(summary.weakCount))}
              </button>
            ) : null}
          </div>
          {weakError ? (
            <SectionError
              message={loadErrorLabel}
              retryLabel={retryLabel}
              onRetry={onRetryWeak}
            />
          ) : weakLoading ? (
            <StatsSectionSkeleton height="h-48" />
          ) : (
            <WeakFlashcardsTable
              data={filteredWeak}
              selectedCategory={selectedCategory}
              onPractice={(item) => onPractice(item.category, item.subcategory)}
            />
          )}
        </div>
      </div>

      <StatsAchievements
        achievements={achievements}
        isLoading={achievementsLoading}
      />
    </div>
  );
};
