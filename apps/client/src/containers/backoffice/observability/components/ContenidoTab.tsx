import { useState, type ReactElement } from 'react';
import { PeriodSelector, type SummaryPeriod } from './PeriodSelector';
import { DailyTrendChart } from './DailyTrendChart';
import { DistributionChart } from './DistributionChart';
import { InsightCard, InsightCardSkeleton } from './InsightCard';
import { useAnalyticsSummary } from '../api/observability.api';

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
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }, (_, i) => (
        <InsightCardSkeleton key={i} />
      ))}
    </div>
    <div className="h-52 rounded-xl bg-[var(--color-bg-elevated)]" />
  </div>
);

export const ContenidoTab = (): ReactElement => {
  const [period, setPeriod] = useState<SummaryPeriod>('7d');
  const { data, isLoading, isError } = useAnalyticsSummary(period);
  const fc = data?.flashcards;

  const audioErrorVariant =
    (fc?.audioStatus.error ?? 0) > 0
      ? 'danger'
      : (fc?.audioStatus.done ?? 0) > 0
        ? 'success'
        : 'neutral';

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {isLoading && <Skeleton />}
      {isError && (
        <p className="text-sm text-[var(--color-text-secondary)] text-center py-8">
          Error cargando estadísticas de contenido.
        </p>
      )}
      {!isLoading && !isError && fc && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <InsightCard
              label="Total flashcards"
              value={fc.total.toLocaleString('es-ES')}
              insight={`${fc.total.toLocaleString('es-ES')} flashcards en el sistema`}
              variant="neutral"
            />
            <InsightCard
              label="Creadas en período"
              value={fc.createdInPeriod.toLocaleString('es-ES')}
              insight={`${fc.createdInPeriod} nuevas flashcards en este período`}
              variant="neutral"
            />
            <InsightCard
              label="Audio listo"
              value={`${fc.audioStatus.done}`}
              insight={
                fc.audioStatus.error > 0
                  ? `${fc.audioStatus.error} errores de audio — revisar ElevenLabs`
                  : `${fc.audioStatus.done} flashcards con audio generado`
              }
              variant={audioErrorVariant}
              sub={`pendiente: ${fc.audioStatus.pending} · error: ${fc.audioStatus.error}`}
            />
          </div>
          {fc.byPeriod.length > 0 && (
            <ChartCard title="Flashcards creadas por período">
              <DailyTrendChart
                data={fc.byPeriod}
                series={[
                  {
                    key: 'count',
                    label: 'Flashcards',
                    type: 'bar',
                    color: '#a78bfa',
                  },
                ]}
              />
            </ChartCard>
          )}
          {fc.byCategory.length > 0 && (
            <ChartCard title="Por categoría">
              <DistributionChart
                data={fc.byCategory.map((c) => ({
                  name: c.category,
                  value: c.count,
                }))}
                height={160}
                horizontal
              />
            </ChartCard>
          )}
        </div>
      )}
    </div>
  );
};
