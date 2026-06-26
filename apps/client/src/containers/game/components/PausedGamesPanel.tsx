import { type ReactElement, useState } from 'react';
import { useI18n } from '@/core/i18n';
import type { FlashcardCatalogApiModel } from '@/core/api/flashcard-catalog.api-model';
import type { GameModule } from '../api/game.api-model';
import type { PausedGameVM } from '../game.types';

interface PausedGamesPanelProps {
  games: PausedGameVM[];
  catalog: FlashcardCatalogApiModel | undefined;
  onContinue: (gameId: string) => void;
  onAbandon: (gameId: string) => void;
  isAbandoning?: boolean;
}

const formatRelativeTime = (date: Date, locale: string): string => {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 60) {
    return locale === 'es' ? `hace ${diffMins} min` : `${diffMins}m ago`;
  }
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return locale === 'es' ? `hace ${diffHours} h` : `${diffHours}h ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return locale === 'es' ? `hace ${diffDays} d` : `${diffDays}d ago`;
};

export const PausedGamesPanel = ({
  games,
  catalog,
  onContinue,
  onAbandon,
  isAbandoning = false,
}: PausedGamesPanelProps): ReactElement | null => {
  const { t, locale } = useI18n();
  const gp = t.game.paused;
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (games.length === 0) return null;

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
    <div className="mb-8 w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
        {gp.title}
      </h2>
      <ul className="space-y-2">
        {games.map((game) => {
          const subLabel = subcategoryLabel(game.module, game.subcategory);
          return (
            <li
              key={game.gameId}
              className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {moduleLabel(game.module)}
                  {subLabel ? ` · ${subLabel}` : ''}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {game.cardCount} {gp.cards} ·{' '}
                  {formatRelativeTime(game.startedAt, locale)}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                {confirmId === game.gameId ? (
                  <>
                    <button
                      type="button"
                      disabled={isAbandoning}
                      onClick={() => onAbandon(game.gameId)}
                      className="rounded-full border border-[var(--color-accent-red)] px-3 py-1.5 text-xs font-semibold text-[var(--color-accent-red)]"
                    >
                      {gp.abandonConfirm}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(null)}
                      className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-text-muted)]"
                    >
                      {gp.cancel}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => onContinue(game.gameId)}
                      className="rounded-full bg-[var(--color-brand)] px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      {gp.continue}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(game.gameId)}
                      className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent-red)]"
                    >
                      {gp.abandon}
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
