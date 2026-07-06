import { type ReactElement, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/common/components/ui/table';
import type { HttpBreakdownRow } from '../utils/parseMetrics';
import { useI18n } from '@/core/i18n';

const PAGE_SIZE = 10;

const STATUS_CLASSES: Record<HttpBreakdownRow['statusClass'], string> = {
  '2xx': 'text-[var(--color-accent-green)] bg-[var(--color-accent-green)]/10',
  '3xx': 'text-[var(--color-brand)] bg-[var(--color-brand-dim)]',
  '4xx': 'text-[var(--color-brand)] bg-[var(--color-brand-dim)]',
  '5xx': 'text-[var(--color-accent-red)] bg-[var(--color-accent-red)]/10',
  other: 'text-[var(--color-text-muted)] bg-[var(--color-bg-elevated)]',
};

interface HttpBreakdownTableProps {
  rows: HttpBreakdownRow[];
  totalRequests: number;
}

export const HttpBreakdownTable = ({
  rows,
  totalRequests,
}: HttpBreakdownTableProps): ReactElement => {
  const { locale, t } = useI18n();
  const numberLocale = locale === 'es' ? 'es-ES' : 'en-US';
  const [page, setPage] = useState(0);

  if (rows.length === 0) {
    return (
      <p className="text-[var(--color-text-secondary)] text-sm text-center py-8">
        {t.backoffice.observability.httpTable.noData}
      </p>
    );
  }

  // Already sorted desc by count from parseMetrics
  const totalPages = Math.ceil(rows.length / PAGE_SIZE);
  const pageRows = rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const startRank = page * PAGE_SIZE + 1;

  return (
    <div className="space-y-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 text-center">#</TableHead>
            <TableHead>
              {t.backoffice.observability.httpTable.endpoint}
            </TableHead>
            <TableHead className="w-20">
              {t.backoffice.observability.httpTable.method}
            </TableHead>
            <TableHead className="w-20">
              {t.backoffice.observability.httpTable.status}
            </TableHead>
            <TableHead className="text-right w-28">
              {t.backoffice.observability.httpTable.requests}
            </TableHead>
            <TableHead className="text-right w-16">%</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageRows.map((row, idx) => (
            <TableRow key={`${row.handler}-${row.method}-${row.status}`}>
              <TableCell className="text-center text-xs text-[var(--color-text-muted)]">
                {startRank + idx}
              </TableCell>
              <TableCell className="font-mono text-xs text-[var(--color-text-primary)] max-w-xs truncate">
                {row.handler}
              </TableCell>
              <TableCell>
                <span className="text-xs font-mono text-[var(--color-text-secondary)] uppercase">
                  {row.method}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={`text-xs font-mono font-medium px-1.5 py-0.5 rounded ${STATUS_CLASSES[row.statusClass]}`}
                >
                  {row.status}
                </span>
              </TableCell>
              <TableCell className="text-right font-mono text-sm text-[var(--color-text-primary)]">
                {row.count.toLocaleString(numberLocale)}
              </TableCell>
              <TableCell className="text-right text-xs text-[var(--color-text-muted)]">
                {totalRequests > 0
                  ? ((row.count / totalRequests) * 100).toFixed(1)
                  : '0'}
                %
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-[var(--color-text-muted)]">
            {t.backoffice.observability.httpTable.endpointsRange
              .replace('{start}', String(startRank))
              .replace(
                '{end}',
                String(Math.min(page * PAGE_SIZE + PAGE_SIZE, rows.length)),
              )
              .replace('{total}', String(rows.length))}
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 0}
              aria-label={
                t.backoffice.observability.httpTable.previousPageAriaLabel
              }
              className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs text-[var(--color-text-secondary)] px-2">
              {page + 1} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages - 1}
              aria-label={
                t.backoffice.observability.httpTable.nextPageAriaLabel
              }
              className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
