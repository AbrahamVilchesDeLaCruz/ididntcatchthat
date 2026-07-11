import { type ReactElement } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { BackofficePageShell } from '@/common/components/BackofficePageShell';
import { PeriodSelector } from '@/containers/backoffice/observability/components/PeriodSelector';
import {
  InsightCard,
  InsightCardSkeleton,
} from '@/containers/backoffice/observability/components/InsightCard';
import { DailyTrendChart } from '@/containers/backoffice/observability/components/DailyTrendChart';
import type { UserStatsVM, UserStatsPeriod } from './backoffice-users.types';
import { useI18n } from '@/core/i18n';
import { chartSeriesColor } from '@/common/charts/chartPalette';
import { engagementVariant } from './engagementThresholds';

interface BackofficeUsersComponentProps {
  stats: UserStatsVM | null;
  period: UserStatsPeriod;
  onPeriodChange: (p: UserStatsPeriod) => void;
  isLoading: boolean;
  isError: boolean;
  lastUpdatedAt?: number;
  onRetry: () => void;
}

const ChartCard = ({
  title,
  children,
}: {
  title: string;
  children: ReactElement;
}): ReactElement => (
  <div className="bg-[var(--color-bg-card)] rounded-xl p-6 border border-[var(--color-border)]">
    <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">
      {title}
    </h2>
    {children}
  </div>
);

const KpiSkeleton = (): ReactElement => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {Array.from({ length: 5 }, (_, i) => (
        <InsightCardSkeleton key={i} />
      ))}
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }, (_, i) => (
        <InsightCardSkeleton key={i} />
      ))}
    </div>
    <div className="h-56 rounded-xl bg-[var(--color-bg-elevated)]" />
  </div>
);

export const BackofficeUsersComponent = ({
  stats,
  period,
  onPeriodChange,
  isLoading,
  isError,
  lastUpdatedAt,
  onRetry,
}: BackofficeUsersComponentProps): ReactElement => {
  const { locale, t } = useI18n();
  const numberLocale = locale === 'es' ? 'es-ES' : 'en-US';

  const engagementVariantValue = engagementVariant(stats?.engagementRate ?? 0);

  return (
    <BackofficePageShell
      title={t.backoffice.users.title}
      subtitle={t.backoffice.users.subtitle}
      isError={isError}
      onRetry={onRetry}
      lastUpdatedAt={lastUpdatedAt}
      headerExtra={<PeriodSelector value={period} onChange={onPeriodChange} />}
    >
      {isLoading ? (
        <KpiSkeleton />
      ) : (
        stats && (
          <>
            {/* ── Snapshot all-time ──────────────────────────────────────────── */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
                {t.backoffice.users.snapshotAllTime}
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <InsightCard
                  label={t.backoffice.users.totalUsers}
                  value={stats.totalUsers.toLocaleString(numberLocale)}
                  insight={t.backoffice.users.totalUsersInsight}
                  variant="neutral"
                />
                <InsightCard
                  label={t.backoffice.users.neverPlayed}
                  value={stats.neverPlayed.toLocaleString(numberLocale)}
                  insight={
                    stats.totalUsers > 0
                      ? t.backoffice.users.neverPlayedInsight.replace(
                          '{percent}',
                          (
                            (stats.neverPlayed / stats.totalUsers) *
                            100
                          ).toFixed(1),
                        )
                      : t.backoffice.users.noRegisteredUsers
                  }
                  variant={
                    stats.neverPlayed / Math.max(stats.totalUsers, 1) > 0.5
                      ? 'warning'
                      : 'neutral'
                  }
                />
                <InsightCard
                  label={t.backoffice.users.usersWithStreak}
                  value={stats.usersWithStreak.toLocaleString(numberLocale)}
                  insight={t.backoffice.users.usersWithStreakInsight.replace(
                    '{count}',
                    stats.usersWithStreak.toLocaleString(numberLocale),
                  )}
                  variant={stats.usersWithStreak > 0 ? 'success' : 'neutral'}
                />
                <InsightCard
                  label={t.backoffice.users.averageLongestStreak}
                  value={stats.avgLongestStreak.toFixed(1)}
                  insight={t.backoffice.users.averageLongestStreakInsight}
                  variant="neutral"
                />
                <InsightCard
                  label={t.backoffice.users.googleVsEmail}
                  value={`${stats.googleUsers} / ${stats.emailUsers}`}
                  insight={t.backoffice.users.googleVsEmailInsight
                    .replace(
                      '{google}',
                      stats.googleUsers.toLocaleString(numberLocale),
                    )
                    .replace(
                      '{email}',
                      stats.emailUsers.toLocaleString(numberLocale),
                    )}
                  variant="neutral"
                />
              </div>
            </div>

            {/* ── Period-aware KPIs ──────────────────────────────────────────── */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
                {t.backoffice.users.selectedPeriod}
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <InsightCard
                  label={t.backoffice.users.newRegistrations}
                  value={stats.newRegistrations.toLocaleString(numberLocale)}
                  insight={t.backoffice.users.newRegistrationsInsight.replace(
                    '{count}',
                    stats.newRegistrations.toLocaleString(numberLocale),
                  )}
                  variant="neutral"
                />
                <InsightCard
                  label={t.backoffice.users.activeUsers}
                  value={stats.activeUsers.toLocaleString(numberLocale)}
                  insight={t.backoffice.users.activeUsersInsight.replace(
                    '{count}',
                    stats.activeUsers.toLocaleString(numberLocale),
                  )}
                  variant={stats.activeUsers > 0 ? 'success' : 'neutral'}
                />
                <InsightCard
                  label={t.backoffice.users.engagementRate}
                  value={`${stats.engagementRate.toFixed(1)}%`}
                  insight={t.backoffice.users.engagementRateInsight.replace(
                    '{percent}',
                    stats.engagementRate.toFixed(1),
                  )}
                  variant={engagementVariantValue}
                  progress={Math.min(stats.engagementRate * 2, 100)}
                  sub={t.backoffice.users.engagementRateThresholdHint}
                />
              </div>
            </div>

            {/* ── Canal de registro (33%) + registros por período (66%) ──── */}
            {(stats.byProvider.length > 0 || stats.byPeriod.length > 0) && (
              <div className="grid grid-cols-3 gap-6">
                {stats.byProvider.length > 0 && (
                  <ChartCard
                    title={t.backoffice.users.charts.registrationChannel}
                  >
                    <div style={{ height: 240 }}>
                      {stats.byProvider.every((p) => p.count === 0) ? (
                        <div className="flex items-center justify-center h-full text-xs text-[var(--color-text-muted)]">
                          {t.backoffice.charts.noDataInPeriod}
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={stats.byProvider.map((p) => ({
                                name:
                                  p.provider === 'google'
                                    ? t.backoffice.users.charts.google
                                    : t.backoffice.users.charts.email,
                                value: p.count,
                              }))}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={85}
                              paddingAngle={2}
                            >
                              {stats.byProvider.map((_, i) => (
                                <Cell
                                  key={i}
                                  fill={chartSeriesColor(i)}
                                  fillOpacity={0.85}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'var(--color-bg-elevated)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '8px',
                                fontSize: 12,
                                color: 'var(--color-text-primary)',
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </ChartCard>
                )}

                <div className="col-span-2">
                  {stats.byPeriod.length > 0 && (
                    <ChartCard
                      title={t.backoffice.users.charts.registrationsByPeriod}
                    >
                      <DailyTrendChart
                        data={stats.byPeriod}
                        series={[
                          {
                            key: 'count',
                            label: t.backoffice.users.charts.newUsers,
                            type: 'bar',
                            color: 'var(--color-accent-green)',
                          },
                        ]}
                        height={240}
                        ariaLabel={
                          t.backoffice.users.charts.registrationsByPeriod
                        }
                      />
                    </ChartCard>
                  )}
                </div>
              </div>
            )}
          </>
        )
      )}
    </BackofficePageShell>
  );
};
