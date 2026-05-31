import { type ReactElement } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { MetricVM } from '../observability.types';

const METRICS_OF_INTEREST = [
  'http_requests_total',
  'http_request_duration_seconds',
];

interface MetricsTableProps {
  metrics: MetricVM[];
}

export const MetricsTable = ({ metrics }: MetricsTableProps): ReactElement => {
  const filtered = metrics.filter((m) => METRICS_OF_INTEREST.includes(m.name));

  if (filtered.length === 0) {
    return (
      <p className="text-[var(--color-text-secondary)] text-sm text-center py-8">
        Sin métricas disponibles
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {filtered.map((metric) => (
        <div key={metric.name}>
          <div className="mb-2">
            <span className="font-mono text-sm text-[var(--color-brand)]">
              {metric.name}
            </span>
            <span className="ml-2 text-xs text-[var(--color-text-secondary)] uppercase">
              ({metric.type})
            </span>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              {metric.help}
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Labels</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metric.samples.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center text-[var(--color-text-secondary)] text-sm"
                  >
                    Sin muestras
                  </TableCell>
                </TableRow>
              ) : (
                metric.samples.map((sample, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono text-xs text-[var(--color-text-secondary)]">
                      {Object.entries(sample.labels)
                        .map(([k, v]) => `${k}="${v}"`)
                        .join(', ') || '—'}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-[var(--color-text-primary)]">
                      {sample.value.toLocaleString('es-ES', {
                        maximumFractionDigits: 4,
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
};
