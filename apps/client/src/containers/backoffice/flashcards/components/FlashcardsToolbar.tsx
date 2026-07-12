import {
  type ChangeEvent,
  type ReactElement,
  useEffect,
  useState,
} from 'react';
import { Search } from 'lucide-react';
import type { FlashcardCatalogApiModel } from '../api/flashcards.api-model';
import { AppSelect } from '@/common/components/ui/select';
import { useI18n } from '@/core/i18n';

const QUERY_DEBOUNCE_MS = 300;

const AUDIO_STATUSES = ['pending', 'generating', 'ready', 'failed'] as const;

interface FlashcardsToolbarProps {
  catalog: FlashcardCatalogApiModel | undefined;
  categoryFilter: string | undefined;
  subcategoryFilter: string | undefined;
  audioStatusFilter: string | undefined;
  pageItemCount: number;
  isBulkRegenerating: boolean;
  queryFilter: string | undefined;
  onQueryFilter: (query: string | undefined) => void;
  onCategoryFilter: (category: string | undefined) => void;
  onSubcategoryFilter: (subcategory: string | undefined) => void;
  onAudioStatusFilter: (audioStatus: string | undefined) => void;
  onBulkRegenerateAudio: () => void;
}

export const FlashcardsToolbar = ({
  catalog,
  categoryFilter,
  subcategoryFilter,
  audioStatusFilter,
  pageItemCount,
  isBulkRegenerating,
  queryFilter,
  onQueryFilter,
  onCategoryFilter,
  onSubcategoryFilter,
  onAudioStatusFilter,
  onBulkRegenerateAudio,
}: FlashcardsToolbarProps): ReactElement => {
  const { locale, t } = useI18n();
  const audioStatusLabels = t.backoffice.flashcards.toolbar.audioStatuses;

  const [inputValue, setInputValue] = useState<string>(queryFilter ?? '');
  const [previousQuery, setPreviousQuery] = useState<string | undefined>(
    queryFilter,
  );

  // Sync external `queryFilter` changes (e.g. parent cleared the search) into
  // the input via the React "store previous" pattern — no useEffect needed.
  if (queryFilter !== previousQuery) {
    setPreviousQuery(queryFilter);
    setInputValue(queryFilter ?? '');
  }

  // Debounce the search: fire onQueryFilter after the user stops typing.
  useEffect(() => {
    const trimmed = inputValue.trim();
    const nextValue = trimmed.length === 0 ? undefined : trimmed;
    if (nextValue === queryFilter) return;
    const timeoutId = setTimeout(() => {
      onQueryFilter(nextValue);
    }, QUERY_DEBOUNCE_MS);
    return (): void => {
      clearTimeout(timeoutId);
    };
  }, [inputValue, queryFilter, onQueryFilter]);

  const subcategories =
    catalog?.categories.find((c) => c.value === categoryFilter)
      ?.subcategories ?? [];

  const hasActiveFilters = !!(
    categoryFilter ??
    subcategoryFilter ??
    audioStatusFilter ??
    queryFilter
  );

  const handleCategoryChange = (value: string): void => {
    onCategoryFilter(value || undefined);
    onSubcategoryFilter(undefined);
  };

  const handleClearFilters = (): void => {
    onCategoryFilter(undefined);
    onSubcategoryFilter(undefined);
    onAudioStatusFilter(undefined);
    onQueryFilter(undefined);
    setInputValue('');
  };

  const handleQueryChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setInputValue(e.target.value);
  };

  const showBulkRegenerate =
    audioStatusFilter === 'pending' || audioStatusFilter === 'failed';

  const bulkRegenerateLabel =
    audioStatusFilter === 'pending'
      ? t.backoffice.flashcards.toolbar.regeneratePagePending.replace(
          '{count}',
          String(pageItemCount),
        )
      : t.backoffice.flashcards.toolbar.regeneratePageFailed.replace(
          '{count}',
          String(pageItemCount),
        );

  const bulkRegenerateAriaLabel =
    audioStatusFilter === 'pending'
      ? t.backoffice.flashcards.toolbar.regeneratePagePendingAriaLabel
      : t.backoffice.flashcards.toolbar.regeneratePageFailedAriaLabel;

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Search input */}
      <div className="relative">
        <label htmlFor="query-filter" className="sr-only">
          {t.backoffice.flashcards.toolbar.filterBySearch}
        </label>
        <input
          id="query-filter"
          type="text"
          value={inputValue}
          onChange={handleQueryChange}
          placeholder={t.backoffice.flashcards.toolbar.searchPlaceholder}
          className="pl-9 pr-8 py-2 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-dim)] w-64"
        />
        <Search
          aria-hidden="true"
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] pointer-events-none"
        />
        {inputValue.length > 0 && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setInputValue('');
              onQueryFilter(undefined);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition px-1"
          >
            ×
          </button>
        )}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category-filter" className="sr-only">
          {t.backoffice.flashcards.toolbar.filterByCategory}
        </label>
        <AppSelect.Root
          id="category-filter"
          value={categoryFilter ?? ''}
          onValueChange={(value) => {
            handleCategoryChange(value ?? '');
          }}
        >
          <AppSelect.Trigger>
            <AppSelect.Value
              placeholder={t.backoffice.flashcards.toolbar.allCategories}
            />
            <AppSelect.Icon />
          </AppSelect.Trigger>
          <AppSelect.Portal>
            <AppSelect.Positioner>
              <AppSelect.Popup>
                <AppSelect.List>
                  {catalog?.categories.map((c) => (
                    <AppSelect.Item key={c.value} value={c.value}>
                      {c.label[locale]}
                    </AppSelect.Item>
                  ))}
                </AppSelect.List>
              </AppSelect.Popup>
            </AppSelect.Positioner>
          </AppSelect.Portal>
        </AppSelect.Root>
      </div>

      {/* Subcategory */}
      <div>
        <label htmlFor="subcategory-filter" className="sr-only">
          {t.backoffice.flashcards.toolbar.filterBySubcategory}
        </label>
        <AppSelect.Root
          id="subcategory-filter"
          value={subcategoryFilter ?? ''}
          disabled={!categoryFilter}
          onValueChange={(value) => {
            onSubcategoryFilter(value ?? undefined);
          }}
        >
          <AppSelect.Trigger>
            <AppSelect.Value
              placeholder={
                categoryFilter
                  ? t.backoffice.flashcards.toolbar.allSubcategories
                  : t.backoffice.flashcards.toolbar.chooseCategoryFirst
              }
            />
            <AppSelect.Icon />
          </AppSelect.Trigger>
          <AppSelect.Portal>
            <AppSelect.Positioner>
              <AppSelect.Popup>
                <AppSelect.List>
                  {subcategories.map((s) => (
                    <AppSelect.Item key={s.value} value={s.value}>
                      {s.label[locale]}
                    </AppSelect.Item>
                  ))}
                </AppSelect.List>
              </AppSelect.Popup>
            </AppSelect.Positioner>
          </AppSelect.Portal>
        </AppSelect.Root>
      </div>

      {/* Audio status */}
      <div>
        <label htmlFor="audio-status-filter" className="sr-only">
          {t.backoffice.flashcards.toolbar.filterByAudioStatus}
        </label>
        <AppSelect.Root
          id="audio-status-filter"
          value={audioStatusFilter ?? ''}
          onValueChange={(value) => {
            onAudioStatusFilter(value ?? undefined);
          }}
        >
          <AppSelect.Trigger>
            <AppSelect.Value
              placeholder={t.backoffice.flashcards.toolbar.allAudioStatuses}
            />
            <AppSelect.Icon />
          </AppSelect.Trigger>
          <AppSelect.Portal>
            <AppSelect.Positioner>
              <AppSelect.Popup>
                <AppSelect.List>
                  {AUDIO_STATUSES.map((status) => (
                    <AppSelect.Item key={status} value={status}>
                      {audioStatusLabels[status]}
                    </AppSelect.Item>
                  ))}
                </AppSelect.List>
              </AppSelect.Popup>
            </AppSelect.Positioner>
          </AppSelect.Portal>
        </AppSelect.Root>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleClearFilters}
          className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition"
        >
          {t.backoffice.flashcards.toolbar.clearFilters}
        </button>
      )}

      {showBulkRegenerate && (
        <button
          type="button"
          onClick={onBulkRegenerateAudio}
          disabled={pageItemCount === 0 || isBulkRegenerating}
          aria-label={bulkRegenerateAriaLabel}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm font-medium text-[var(--color-text-primary)] transition hover:border-[var(--color-brand)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isBulkRegenerating && (
            <span className="w-3 h-3 rounded-full border-2 border-[var(--color-border-strong)] border-t-[var(--color-text-secondary)] animate-spin" />
          )}
          {bulkRegenerateLabel}
        </button>
      )}
    </div>
  );
};
