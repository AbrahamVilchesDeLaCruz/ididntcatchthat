import { type ReactElement, useState } from 'react';
import { useI18n } from '@/core/i18n';
import type { FlashcardCatalogApiModel } from '@/core/api/flashcard-catalog.api-model';
import type { GameModule } from '../api/game.api-model';
import type { PausedGameVM } from '../game.types';

interface MaxPausedGamesModalProps {
  games: PausedGameVM[];
  catalog: FlashcardCatalogApiModel | undefined;
  onAbandon: (gameId: string) => void;
  onClose: () => void;
  isAbandoning?: boolean;
}

export const MaxPausedGamesModal = ({
  games,
  catalog,
  onAbandon,
  onClose,
  isAbandoning = false,
}: MaxPausedGamesModalProps): ReactElement => {
  const { t, locale } = useI18n();
  const gp = t.game.paused;
  const [chooseMode, setChooseMode] = useState(false);

  const sorted = [...games].sort(
    (a, b) => a.startedAt.getTime() - b.startedAt.getTime(),
  );
  const oldest = sorted[0];

  const moduleLabel = (module: string | null): string => {
    if (module === null) return gp.randomModule;
    return t.game.config.modules[module as GameModule] ?? module;
  };

  const subcategoryLabel = (
    module: string | null,
    subcategory: string | null,
  ): string | null => {
    if (!module || !subcategory || !catalog) return null;
    const meta = catalog.categories
      .find((c) => c.value === module)
      ?.subcategories.find((s) => s.value === subcategory);
    return meta?.label[locale] ?? subcategory.replaceAll('_', ' ');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="max-paused-title"
    >
      <div className="w-full max-w-md rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 shadow-xl">
        <h2
          id="max-paused-title"
          className="mb-2 text-lg font-bold text-[var(--color-text-primary)]"
        >
          {gp.maxModalTitle}
        </h2>
        <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
          {gp.maxModalBody}
        </p>

        {chooseMode ? (
          <ul className="mb-4 max-h-48 space-y-2 overflow-y-auto">
            {sorted.map((game) => {
              const subLabel = subcategoryLabel(game.module, game.subcategory);
              return (
                <li
                  key={game.gameId}
                  className="flex items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3"
                >
                  <span className="text-sm text-[var(--color-text-primary)]">
                    {moduleLabel(game.module)}
                    {subLabel ? ` · ${subLabel}` : ''}
                  </span>
                  <button
                    type="button"
                    disabled={isAbandoning}
                    onClick={() => onAbandon(game.gameId)}
                    className="shrink-0 rounded-full border border-[var(--color-accent-red)] px-3 py-1 text-xs font-semibold text-[var(--color-accent-red)]"
                  >
                    {gp.abandon}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}

        <div className="flex flex-col gap-2">
          {!chooseMode && oldest ? (
            <button
              type="button"
              disabled={isAbandoning}
              onClick={() => onAbandon(oldest.gameId)}
              className="w-full rounded-full bg-[var(--color-brand)] py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {gp.abandonOldest}
            </button>
          ) : null}
          {!chooseMode ? (
            <button
              type="button"
              onClick={() => setChooseMode(true)}
              className="w-full rounded-full border border-[var(--color-border-strong)] py-3 text-sm text-[var(--color-text-secondary)]"
            >
              {gp.chooseToAbandon}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-sm text-[var(--color-text-muted)] hover:underline"
          >
            {gp.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};
