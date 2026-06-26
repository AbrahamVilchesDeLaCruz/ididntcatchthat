import { type ReactElement } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/common/components/ui/table';
import { useI18n } from '@/core/i18n';
import type { GameModule } from '@/containers/game/api/game.api-model';
import type { WeakFlashcardVM } from '../stats.types';

interface WeakFlashcardsTableProps {
  data: WeakFlashcardVM[];
}

export const WeakFlashcardsTable = ({
  data,
}: WeakFlashcardsTableProps): ReactElement => {
  const { t } = useI18n();

  const formatModule = (category: string): string =>
    t.game.config.modules[category as GameModule] ?? category;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Expresión</TableHead>
          <TableHead>Módulo</TableHead>
          <TableHead>Errores</TableHead>
          <TableHead>Último intento</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={4}
              className="text-center text-[var(--color-text-secondary)] py-8"
            >
              Sin datos de flashcards débiles
            </TableCell>
          </TableRow>
        ) : (
          data.map((item) => (
            <TableRow key={item.flashcardId}>
              <TableCell className="text-[var(--color-text-primary)]">
                {item.expression}
              </TableCell>
              <TableCell>
                <span className="block text-[var(--color-text-primary)]">
                  {formatModule(item.category)}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {item.subcategory.replaceAll('_', ' ')}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-[var(--color-accent-red)] font-semibold">
                  {item.errorCount}
                </span>
              </TableCell>
              <TableCell className="text-[var(--color-text-secondary)] text-sm">
                {item.lastAttemptAt.toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};
