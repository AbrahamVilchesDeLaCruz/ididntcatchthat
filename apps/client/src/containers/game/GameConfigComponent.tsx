import { type ReactElement, useMemo } from 'react';
import { useI18n } from '@/core/i18n';
import type { FlashcardCatalogApiModel } from '@/core/api/flashcard-catalog.api-model';
import type { GameModule } from './api/game.api-model';

const MODULES: GameModule[] = [
  'random',
  'native_sounds',
  'connected_speech',
  'flow_connectors',
  'real_talk',
];

const CARD_COUNTS = [10, 20, 50] as const;
type CardCount = (typeof CARD_COUNTS)[number];

interface GameConfigComponentProps {
  selectedModule: GameModule;
  selectedSubcategory: string | null;
  selectedCount: CardCount;
  catalog: FlashcardCatalogApiModel | undefined;
  isPending: boolean;
  guestError?: boolean;
  pausedSavedBanner?: boolean;
  pausedGamesPanel?: ReactElement;
  onGuestRetry?: () => void;
  onModuleChange: (m: GameModule) => void;
  onSubcategoryChange: (subcategory: string | null) => void;
  onCountChange: (c: CardCount) => void;
  onStart: () => void;
}

export const GameConfigComponent = ({
  selectedModule,
  selectedSubcategory,
  selectedCount,
  catalog,
  isPending,
  guestError = false,
  pausedSavedBanner = false,
  pausedGamesPanel,
  onGuestRetry,
  onModuleChange,
  onSubcategoryChange,
  onCountChange,
  onStart,
}: GameConfigComponentProps): ReactElement => {
  const { t, locale } = useI18n();
  const gc = t.game.config;

  const subcategories = useMemo(() => {
    if (selectedModule === 'random' || !catalog) {
      return [];
    }
    return (
      catalog.categories.find((c) => c.value === selectedModule)
        ?.subcategories ?? []
    );
  }, [catalog, selectedModule]);

  const showSubcategoryStep = selectedModule !== 'random';

  if (guestError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-[var(--color-bg-base)] px-5 py-16">
        <p className="text-center text-[var(--color-accent-red)]">
          {gc.guestError}
        </p>
        <button
          type="button"
          onClick={onGuestRetry}
          className="rounded-full bg-[var(--color-brand)] px-6 py-3 text-sm font-semibold text-white"
        >
          {gc.guestRetry}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-[var(--color-bg-base)] px-5 py-16">
      {pausedSavedBanner ? (
        <div className="mb-6 w-full max-w-md rounded-[var(--radius-md)] border border-[var(--color-brand-dim)] bg-[var(--color-brand-dim)] px-4 py-3 text-center text-sm text-[var(--color-brand-light)]">
          {gc.pausedSaved}
        </div>
      ) : null}

      {pausedGamesPanel}

      <div className="mb-10 text-center">
        <h1 className="mb-2 text-3xl font-bold text-[var(--color-text-primary)]">
          {gc.title}
        </h1>
        <p className="text-[var(--color-text-secondary)]">{gc.subtitle}</p>
      </div>

      <div className="w-full max-w-md space-y-8">
        <div>
          <label className="mb-3 block text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
            {gc.moduleLabel}
          </label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {MODULES.map((mod) => (
              <button
                key={mod}
                type="button"
                onClick={() => onModuleChange(mod)}
                className={[
                  'rounded-[var(--radius-md)] border px-4 py-3 text-sm font-medium text-left transition-colors',
                  selectedModule === mod
                    ? 'border-[var(--color-brand)] bg-[var(--color-brand-dim)] text-[var(--color-brand-light)]'
                    : 'border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand)] hover:text-[var(--color-text-primary)]',
                ].join(' ')}
              >
                {gc.modules[mod]}
              </button>
            ))}
          </div>
        </div>

        {showSubcategoryStep && (
          <div>
            <label className="mb-3 block text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
              {gc.subcategoryLabel}
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              <button
                type="button"
                onClick={() => onSubcategoryChange(null)}
                className={[
                  'rounded-[var(--radius-md)] border px-4 py-3 text-sm font-medium text-left transition-colors',
                  selectedSubcategory === null
                    ? 'border-[var(--color-brand)] bg-[var(--color-brand-dim)] text-[var(--color-brand-light)]'
                    : 'border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand)] hover:text-[var(--color-text-primary)]',
                ].join(' ')}
              >
                {gc.wholeCategory}
              </button>
              {subcategories.map((sub) => (
                <button
                  key={sub.value}
                  type="button"
                  onClick={() => onSubcategoryChange(sub.value)}
                  className={[
                    'rounded-[var(--radius-md)] border px-4 py-3 text-sm font-medium text-left transition-colors',
                    selectedSubcategory === sub.value
                      ? 'border-[var(--color-brand)] bg-[var(--color-brand-dim)] text-[var(--color-brand-light)]'
                      : 'border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand)] hover:text-[var(--color-text-primary)]',
                  ].join(' ')}
                >
                  {sub.label[locale]}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="mb-3 block text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
            {gc.countLabel}
          </label>
          <div className="flex gap-3">
            {CARD_COUNTS.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => onCountChange(count)}
                className={[
                  'flex-1 rounded-[var(--radius-md)] border py-3 text-sm font-semibold transition-colors',
                  selectedCount === count
                    ? 'border-[var(--color-brand)] bg-[var(--color-brand-dim)] text-[var(--color-brand-light)]'
                    : 'border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand)] hover:text-[var(--color-text-primary)]',
                ].join(' ')}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onStart}
          disabled={isPending}
          className="w-full rounded-full bg-[var(--color-brand)] py-4 text-base font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {gc.ctaStart}
            </span>
          ) : (
            gc.ctaStart
          )}
        </button>
      </div>
    </div>
  );
};
