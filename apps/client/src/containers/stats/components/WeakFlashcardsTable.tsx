import { type ReactElement, useMemo } from 'react';
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
import type { WeakFlashcardVM } from '../stats.types';

interface WeakFlashcardsTableProps {
  data: WeakFlashcardVM[];
  selectedCategory?: string | null;
  onPractice?: (item: WeakFlashcardVM) => void;
}

export const WeakFlashcardsTable = ({
  data,
  selectedCategory = null,
  onPractice,
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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{st.table.expression}</TableHead>
          <TableHead>{st.table.module}</TableHead>
          <TableHead>{st.table.errors}</TableHead>
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
              <TableCell>
                <span className="block text-[var(--color-text-primary)]">
                  {formatModule(item.category)}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {formatSubcategory(item.category, item.subcategory)}
                </span>
              </TableCell>
              <TableCell>
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
  );
};
