import { useState, type ReactElement } from 'react';
import { PeriodSelector, type SummaryPeriod } from './PeriodSelector';
import { DailyTrendChart } from './DailyTrendChart';
import { DistributionChart } from './DistributionChart';
import { InsightCard, InsightCardSkeleton } from './InsightCard';
import { useAnalyticsSummary } from '../api/observability.api';
import { useI18n } from '@/core/i18n';

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
  const { locale, t } = useI18n();
  const numberLocale = locale === 'es' ? 'es-ES' : 'en-US';
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
          {t.backoffice.observability.content.loadError}
        </p>
      )}
      {!isLoading && !isError && fc && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <InsightCard
              label={t.backoffice.observability.content.totalFlashcards}
              value={fc.total.toLocaleString(numberLocale)}
              insight={t.backoffice.observability.content.totalFlashcardsInsight.replace(
                '{count}',
                fc.total.toLocaleString(numberLocale),
              )}
              variant="neutral"
            />
            <InsightCard
              label={t.backoffice.observability.content.createdInPeriod}
              value={fc.createdInPeriod.toLocaleString(numberLocale)}
              insight={t.backoffice.observability.content.createdInPeriodInsight.replace(
                '{count}',
                fc.createdInPeriod.toLocaleString(numberLocale),
              )}
              variant="neutral"
            />
            <InsightCard
              label={t.backoffice.observability.content.audioReady}
              value={`${fc.audioStatus.done}`}
              insight={
                fc.audioStatus.error > 0
                  ? t.backoffice.observability.content.audioErrorInsight.replace(
                      '{count}',
                      fc.audioStatus.error.toLocaleString(numberLocale),
                    )
                  : t.backoffice.observability.content.audioReadyInsight.replace(
                      '{count}',
                      fc.audioStatus.done.toLocaleString(numberLocale),
                    )
              }
              variant={audioErrorVariant}
              sub={t.backoffice.observability.content.audioSub
                .replace(
                  '{pending}',
                  fc.audioStatus.pending.toLocaleString(numberLocale),
                )
                .replace(
                  '{error}',
                  fc.audioStatus.error.toLocaleString(numberLocale),
                )}
            />
          </div>
          {fc.byPeriod.length > 0 && (
            <ChartCard
              title={t.backoffice.observability.content.createdByPeriod}
            >
              <DailyTrendChart
                data={fc.byPeriod}
                series={[
                  {
                    key: 'count',
                    label:
                      t.backoffice.observability.content.flashcardsSeriesLabel,
                    type: 'bar',
                    color: '#a78bfa',
                  },
                ]}
              />
            </ChartCard>
          )}
          {fc.byCategory.length > 0 && (
            <ChartCard title={t.backoffice.observability.content.byCategory}>
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
