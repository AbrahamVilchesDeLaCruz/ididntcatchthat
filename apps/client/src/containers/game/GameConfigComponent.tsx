import { type ReactElement } from 'react';
import { useI18n } from '@/core/i18n';
import type { GameModule } from './api/game.api-model';

const MODULES: GameModule[] = [
  'random',
  'native_sounds',
  'connecting_words',
  'beautifying_sentences',
  'sounding_native',
];

const CARD_COUNTS = [10, 20, 50] as const;
type CardCount = (typeof CARD_COUNTS)[number];

interface GameConfigComponentProps {
  selectedModule: GameModule;
  selectedCount: CardCount;
  isPending: boolean;
  onModuleChange: (m: GameModule) => void;
  onCountChange: (c: CardCount) => void;
  onStart: () => void;
}

export const GameConfigComponent = ({
  selectedModule,
  selectedCount,
  isPending,
  onModuleChange,
  onCountChange,
  onStart,
}: GameConfigComponentProps): ReactElement => {
  const { t } = useI18n();
  const gc = t.game.config;

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-[var(--color-bg-base)] px-5 py-16">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="mb-2 text-3xl font-bold text-[var(--color-text-primary)]">
          {gc.title}
        </h1>
        <p className="text-[var(--color-text-secondary)]">{gc.subtitle}</p>
      </div>

      <div className="w-full max-w-md space-y-8">
        {/* Module selector */}
        <div>
          <label className="mb-3 block text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
            {gc.moduleLabel}
          </label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {MODULES.map((mod) => (
              <button
                key={mod}
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

        {/* Card count selector */}
        <div>
          <label className="mb-3 block text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
            {gc.countLabel}
          </label>
          <div className="flex gap-3">
            {CARD_COUNTS.map((count) => (
              <button
                key={count}
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

        {/* CTA */}
        <button
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
