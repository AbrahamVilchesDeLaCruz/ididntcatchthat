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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }, (_, i) => (
        <InsightCardSkeleton key={i} />
      ))}
    </div>
    <div className="h-52 rounded-xl bg-[var(--color-bg-elevated)]" />
  </div>
);

export const VisitasTab = (): ReactElement => {
  const { locale, t } = useI18n();
  const numberLocale = locale === 'es' ? 'es-ES' : 'en-US';
  const [period, setPeriod] = useState<SummaryPeriod>('7d');
  const { data, isLoading, isError } = useAnalyticsSummary(period);
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
          {t.backoffice.observability.visits.loadError}
        </p>
      )}
      {!isLoading && !isError && pv && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <InsightCard
              label={t.backoffice.observability.visits.totalVisits}
              value={pv.total.toLocaleString(numberLocale)}
              insight={t.backoffice.observability.visits.totalVisitsInsight.replace(
                '{count}',
                pv.total.toLocaleString(numberLocale),
              )}
              variant="neutral"
            />
            <InsightCard
              label={t.backoffice.observability.visits.uniqueVisitors}
              value={pv.uniqueVisitors.toLocaleString(numberLocale)}
              insight={t.backoffice.observability.visits.uniqueVisitorsInsight.replace(
                '{count}',
                pv.uniqueVisitors.toLocaleString(numberLocale),
              )}
              variant="neutral"
            />
            <InsightCard
              label={t.backoffice.observability.visits.conversion}
              value={`${pv.conversionRate.toFixed(1)}%`}
              insight={t.backoffice.observability.visits.conversionInsight.replace(
                '{count}',
                pv.registeredVisitors.toLocaleString(numberLocale),
              )}
              variant={conversionVariant}
              progress={Math.min(pv.conversionRate * 5, 100)}
            />
            {pv.topPages.length > 0 && (
              <InsightCard
                label={t.backoffice.observability.visits.topPage}
                value={pv.topPages[0].path}
                insight={t.backoffice.observability.visits.topPageInsight.replace(
                  '{count}',
                  pv.topPages[0].views.toLocaleString(numberLocale),
                )}
                variant="neutral"
              />
            )}
          </div>
          {pv.byPeriod.length > 0 && (
            <ChartCard title={t.backoffice.observability.visits.visitsByPeriod}>
              <DailyTrendChart
                data={pv.byPeriod}
                series={[
                  {
                    key: 'views',
                    label: t.backoffice.observability.visits.views,
                    type: 'bar',
                    color: 'var(--color-brand)',
                  },
                  {
                    key: 'unique',
                    label: t.backoffice.observability.visits.unique,
                    type: 'line',
                    color: 'var(--color-accent-yellow)',
                  },
                ]}
                ariaLabel={t.backoffice.observability.visits.visitsByPeriod}
              />
            </ChartCard>
          )}
          {pv.topPages.length > 0 && (
            <ChartCard
              title={t.backoffice.observability.visits.topVisitedPages}
            >
              <DistributionChart
                data={pv.topPages
                  .slice(0, 8)
                  .map((p) => ({ name: p.path, value: p.views }))}
                height={Math.max(200, pv.topPages.slice(0, 8).length * 36)}
                horizontal
                ariaLabel={t.backoffice.observability.visits.topVisitedPages}
              />
            </ChartCard>
          )}
        </div>
      )}
    </div>
  );
};
