import { type ReactElement, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/common/components/ui/table';
import { useI18n } from '@/core/i18n';
import { useFlashcardCatalog } from '@/core/api/flashcard-catalog.api';
import type { GameModule } from '@/containers/game/api/game.api-model';
import type { PaginationMeta } from '@/core/api/api-envelope';
import type { WeakFlashcardVM } from '../stats.types';

interface WeakFlashcardsTableProps {
  data: WeakFlashcardVM[];
  selectedCategory?: string | null;
  onPractice?: (item: WeakFlashcardVM) => void;
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
}

export const WeakFlashcardsTable = ({
  data,
  selectedCategory = null,
  onPractice,
  pagination,
  onPageChange,
}: WeakFlashcardsTableProps): ReactElement => {
  const { t, locale } = useI18n();
  const st = t.stats;
  const { data: catalog } = useFlashcardCatalog();

  const visibleData = useMemo(
    () => data.filter((item) => item.errorCount > 0),
    [data],
  );

  const formatModule = (category: string): string =>
    t.game.config.modules[category as GameModule] ?? category;

  const formatSubcategory = (category: string, subcategory: string): string => {
    const meta = catalog?.categories
      .find((c) => c.value === category)
      ?.subcategories.find((s) => s.value === subcategory);
    return meta?.label[locale] ?? subcategory.replaceAll('_', ' ');
  };

  const emptyMessage =
    selectedCategory !== null ? st.noWeakInModule : st.noWeakData;

  const showPagination =
    pagination !== undefined &&
    pagination.total_pages > 1 &&
    onPageChange !== undefined;

  return (
    <div className="space-y-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{st.table.expression}</TableHead>
            <TableHead className="hidden md:table-cell">
              {st.table.module}
            </TableHead>
            <TableHead className="hidden md:table-cell">
              {st.table.errors}
            </TableHead>
            <TableHead>{st.table.lastAttempt}</TableHead>
            {onPractice ? <TableHead /> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={onPractice ? 5 : 4}
                className="text-center text-[var(--color-text-secondary)] py-8"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            visibleData.map((item) => (
              <TableRow key={item.flashcardId}>
                <TableCell className="text-[var(--color-text-primary)]">
                  {item.expression}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="block text-[var(--color-text-primary)]">
                    {formatModule(item.category)}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {formatSubcategory(item.category, item.subcategory)}
                  </span>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-[var(--color-accent-red)] font-semibold">
                    {item.errorCount}
                  </span>
                </TableCell>
                <TableCell className="text-[var(--color-text-secondary)] text-sm">
                  {item.lastAttemptAt.toLocaleDateString(
                    locale === 'es' ? 'es-ES' : 'en-US',
                    {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    },
                  )}
                </TableCell>
                {onPractice ? (
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => onPractice(item)}
                      className="text-xs font-semibold text-[var(--color-brand)] hover:underline"
                    >
                      {st.practice}
                    </button>
                  </TableCell>
                ) : null}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {showPagination && pagination && onPageChange ? (
        <div className="flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
          <span>
            {st.table.pageOf
              .replace('{page}', String(pagination.page))
              .replace('{total}', String(pagination.total_pages))}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={!pagination.has_prev_page}
              aria-label={st.table.previousPageAriaLabel}
              className="inline-flex items-center gap-1 rounded border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-1.5 hover:bg-[var(--color-bg-card)] disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={14} aria-hidden />
              {st.table.previous}
            </button>
            <button
              type="button"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.has_next_page}
              aria-label={st.table.nextPageAriaLabel}
              className="inline-flex items-center gap-1 rounded border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-1.5 hover:bg-[var(--color-bg-card)] disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              {st.table.next}
              <ChevronRight size={14} aria-hidden />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
