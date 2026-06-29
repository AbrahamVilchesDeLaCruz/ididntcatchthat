import { type ReactElement } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/common/components/ui/table';
import type { HttpBreakdownRow } from '../utils/parseMetrics';

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
  if (rows.length === 0) {
    return (
      <p className="text-[var(--color-text-secondary)] text-sm text-center py-8">
        Sin datos de requests HTTP
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Endpoint</TableHead>
          <TableHead className="w-20">Método</TableHead>
          <TableHead className="w-20">Status</TableHead>
          <TableHead className="text-right w-28">Requests</TableHead>
          <TableHead className="text-right w-16">%</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, idx) => (
          <TableRow key={idx}>
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
              {row.count.toLocaleString('es-ES')}
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
  );
};
