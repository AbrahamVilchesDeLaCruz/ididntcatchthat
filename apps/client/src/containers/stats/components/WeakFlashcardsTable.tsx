import { type ReactElement } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/common/components/ui/table';
import type { WeakFlashcardVM } from '../stats.types';

interface WeakFlashcardsTableProps {
  data: WeakFlashcardVM[];
}

export const WeakFlashcardsTable = ({
  data,
}: WeakFlashcardsTableProps): ReactElement => {
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
              <TableCell>{item.module}</TableCell>
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
