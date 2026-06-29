import { useState, type ReactElement } from 'react';
import { PeriodSelector, type StatPeriod } from './PeriodSelector';
import { DailyTrendChart } from './DailyTrendChart';
import { DistributionChart } from './DistributionChart';
import { InsightCard, InsightCardSkeleton } from './InsightCard';
import { useDbStats } from '../api/observability.api';

const ChartCard = ({
  title,
  children,
}: {
  title: string;
  children: ReactElement;
}): ReactElement => (
  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
    <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
      {title}
    </h3>
    {children}
  </div>
);

const Skeleton = (): ReactElement => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }, (_, i) => (
        <InsightCardSkeleton key={i} />
      ))}
    </div>
    <div className="h-52 rounded-xl bg-[var(--color-bg-elevated)]" />
  </div>
);

export const VisitasTab = (): ReactElement => {
  const [period, setPeriod] = useState<StatPeriod>('7d');
  const { data, isLoading, isError } = useDbStats(period);
  const pv = data?.pageViews;

  const conversionVariant =
    (pv?.conversionRate ?? 0) >= 10
      ? 'success'
      : (pv?.conversionRate ?? 0) >= 3
        ? 'warning'
        : 'neutral';

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {isLoading && <Skeleton />}
      {isError && (
        <p className="text-sm text-[var(--color-text-secondary)] text-center py-8">
          Error cargando estadísticas de visitas.
        </p>
      )}
      {!isLoading && !isError && pv && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <InsightCard
              label="Visitas totales"
              value={pv.total.toLocaleString('es-ES')}
              insight={`${pv.total.toLocaleString('es-ES')} páginas vistas en el período`}
              variant="neutral"
            />
            <InsightCard
              label="Visitantes únicos"
              value={pv.uniqueVisitors.toLocaleString('es-ES')}
              insight={`${pv.uniqueVisitors} visitantes únicos (por sesión de navegador)`}
              variant="neutral"
            />
            <InsightCard
              label="Conversión"
              value={`${pv.conversionRate.toFixed(1)}%`}
              insight={`${pv.registeredVisitors} visitantes tienen cuenta registrada`}
              variant={conversionVariant}
              progress={Math.min(pv.conversionRate * 5, 100)}
            />
            {pv.topPages.length > 0 && (
              <InsightCard
                label="Página top"
                value={pv.topPages[0].path}
                insight={`${pv.topPages[0].views} visitas a la ruta más popular`}
                variant="neutral"
              />
            )}
          </div>
          {pv.byPeriod.length > 0 && (
            <ChartCard title="Visitas por período">
              <DailyTrendChart
                data={pv.byPeriod}
                series={[
                  {
                    key: 'views',
                    label: 'Vistas',
                    type: 'bar',
                    color: 'var(--color-brand)',
                  },
                  {
                    key: 'unique',
                    label: 'Únicos',
                    type: 'line',
                    color: 'var(--color-accent-yellow)',
                  },
                ]}
              />
            </ChartCard>
          )}
          {pv.topPages.length > 0 && (
            <ChartCard title="Páginas más visitadas">
              <DistributionChart
                data={pv.topPages
                  .slice(0, 8)
                  .map((p) => ({ name: p.path, value: p.views }))}
                height={Math.max(200, pv.topPages.slice(0, 8).length * 36)}
                horizontal
              />
            </ChartCard>
          )}
        </div>
      )}
    </div>
  );
};
