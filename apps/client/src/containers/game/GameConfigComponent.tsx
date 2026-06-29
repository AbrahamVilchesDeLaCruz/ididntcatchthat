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
  variant?: 'game' | 'study';
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
  variant = 'game',
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
  const sc = t.study.config;
  const isStudy = variant === 'study';
  const copy = isStudy ? sc : gc;

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
  const hasPausedGames = pausedGamesPanel !== undefined;

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
    <div className="relative flex flex-1 flex-col items-center overflow-hidden bg-[var(--color-bg-base)] px-5 py-12 md:py-16 lg:px-8">
      {!isStudy ? <div className="game-glow" aria-hidden /> : null}
      {pausedSavedBanner ? (
        <div
          className={[
            'relative mb-6 w-full max-w-5xl rounded-[var(--radius-md)] border px-4 py-3 text-center text-sm',
            isStudy
              ? 'border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]'
              : 'border-[var(--color-brand-dim)] bg-[var(--color-brand-dim)] text-[var(--color-brand-light)]',
          ].join(' ')}
        >
          {copy.pausedSaved}
        </div>
      ) : null}

      <div
        data-testid="game-config-layout"
        data-layout={hasPausedGames ? 'with-paused' : 'config-only'}
        className={[
          'relative w-full',
          hasPausedGames
            ? 'max-w-5xl lg:grid lg:grid-cols-[minmax(280px,320px)_1fr] lg:items-start lg:gap-10'
            : 'mx-auto max-w-md md:max-w-xl lg:max-w-2xl',
        ].join(' ')}
      >
        {pausedGamesPanel ? (
          <aside className="mb-8 lg:sticky lg:top-20 lg:mb-0 lg:self-start">
            {pausedGamesPanel}
          </aside>
        ) : null}

        <div className="flex flex-col">
          <div className="mb-8 text-center lg:mb-10 lg:text-left">
            <h1 className="mb-2 text-3xl font-bold text-[var(--color-text-primary)] md:text-4xl">
              {copy.title}
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              {copy.subtitle}
            </p>
          </div>

          <div className="space-y-8">
            <div>
              <label className="mb-3 block text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
                {copy.moduleLabel}
              </label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
                  {copy.subcategoryLabel}
                </label>
                <div className="grid max-h-48 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2 md:max-h-none md:overflow-visible lg:grid-cols-3">
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
                    {copy.wholeCategory}
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
                {copy.countLabel}
              </label>
              <div className="flex gap-3 md:max-w-md">
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
              className="w-full rounded-full bg-[var(--color-brand)] py-4 text-base font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 md:max-w-md lg:max-w-none"
            >
              {isPending ? (
                isStudy ? (
                  sc.ctaStarting
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {gc.ctaStart}
                  </span>
                )
              ) : (
                copy.ctaStart
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
