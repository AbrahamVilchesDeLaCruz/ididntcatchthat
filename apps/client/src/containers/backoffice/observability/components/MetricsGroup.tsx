import { type ReactElement, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/common/components/ui/table';
import type { MetricVM } from '../observability.types';

interface MetricsGroupProps {
  category: string;
  metrics: MetricVM[];
  defaultOpen?: boolean;
}

export const MetricsGroup = ({
  category,
  metrics,
  defaultOpen = false,
}: MetricsGroupProps): ReactElement => {
  const [open, setOpen] = useState(defaultOpen);

  const totalSamples = metrics.reduce((sum, m) => sum + m.samples.length, 0);

  return (
    <div className="border border-[var(--color-border)] rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-elevated)] transition text-left"
      >
        <div className="flex items-center gap-3">
          {open ? (
            <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
          )}
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">
            {category}
          </span>
        </div>
        <span className="text-xs text-[var(--color-text-muted)]">
          {metrics.length} métricas · {totalSamples} muestras
        </span>
      </button>

      {open && (
        <div className="divide-y divide-[var(--color-border)] bg-[var(--color-bg-surface)]">
          {metrics.map((metric) => (
            <div key={metric.name} className="px-5 py-4">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-mono text-xs text-[var(--color-brand)]">
                  {metric.name}
                </span>
                <span className="text-xs text-[var(--color-text-muted)] uppercase">
                  {metric.type}
                </span>
              </div>
              {metric.help && (
                <p className="text-xs text-[var(--color-text-secondary)] mb-3">
                  {metric.help}
                </p>
              )}
              {metric.samples.length === 0 ? (
                <p className="text-xs text-[var(--color-text-muted)] italic">
                  Sin muestras
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Labels</TableHead>
                      <TableHead className="text-right w-32">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metric.samples.map((sample, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono text-xs text-[var(--color-text-secondary)]">
                          {Object.keys(sample.labels).length === 0
                            ? '—'
                            : Object.entries(sample.labels)
                                .map(([k, v]) => `${k}="${v}"`)
                                .join(', ')}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm text-[var(--color-text-primary)]">
                          {sample.value.toLocaleString('es-ES', {
                            maximumFractionDigits: 4,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
