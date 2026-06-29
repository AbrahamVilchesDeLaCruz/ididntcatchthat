import { type ReactElement } from 'react';
import { BackofficePageShell } from '@/common/components/BackofficePageShell';
import { PeriodSelector } from '@/containers/backoffice/observability/components/PeriodSelector';
import {
  InsightCard,
  InsightCardSkeleton,
} from '@/containers/backoffice/observability/components/InsightCard';
import { DailyTrendChart } from '@/containers/backoffice/observability/components/DailyTrendChart';
import { DistributionChart } from '@/containers/backoffice/observability/components/DistributionChart';
import type { UserStatsVM, UserStatsPeriod } from './backoffice-users.types';

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
  const engagementVariant =
    (stats?.engagementRate ?? 0) >= 30
      ? 'success'
      : (stats?.engagementRate ?? 0) >= 10
        ? 'warning'
        : 'neutral';

  return (
    <BackofficePageShell
      title="Métricas de usuarios"
      subtitle="Registro, actividad y retención"
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
                Instantánea global
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <InsightCard
                  label="Total usuarios"
                  value={stats.totalUsers.toLocaleString('es-ES')}
                  insight="Usuarios registrados acumulados"
                  variant="neutral"
                />
                <InsightCard
                  label="Nunca jugaron"
                  value={stats.neverPlayed.toLocaleString('es-ES')}
                  insight={
                    stats.totalUsers > 0
                      ? `${((stats.neverPlayed / stats.totalUsers) * 100).toFixed(1)}% se registró pero no activó`
                      : 'Sin usuarios registrados'
                  }
                  variant={
                    stats.neverPlayed / Math.max(stats.totalUsers, 1) > 0.5
                      ? 'warning'
                      : 'neutral'
                  }
                />
                <InsightCard
                  label="Con racha activa"
                  value={stats.usersWithStreak.toLocaleString('es-ES')}
                  insight={`${stats.usersWithStreak} usuarios han jugado días seguidos`}
                  variant={stats.usersWithStreak > 0 ? 'success' : 'neutral'}
                />
                <InsightCard
                  label="Racha media (días)"
                  value={stats.avgLongestStreak.toFixed(1)}
                  insight="Media de la racha más larga por usuario"
                  variant="neutral"
                />
                <InsightCard
                  label="Google vs Email"
                  value={`${stats.googleUsers} / ${stats.emailUsers}`}
                  insight={`${stats.googleUsers} via Google · ${stats.emailUsers} via email`}
                  variant="neutral"
                />
              </div>
            </div>

            {/* ── Period-aware KPIs ──────────────────────────────────────────── */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
                En el período seleccionado
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <InsightCard
                  label="Nuevos registros"
                  value={stats.newRegistrations.toLocaleString('es-ES')}
                  insight={`${stats.newRegistrations} usuarios se registraron en este período`}
                  variant="neutral"
                />
                <InsightCard
                  label="Usuarios activos"
                  value={stats.activeUsers.toLocaleString('es-ES')}
                  insight={`${stats.activeUsers} con al menos una partida en el período`}
                  variant={stats.activeUsers > 0 ? 'success' : 'neutral'}
                />
                <InsightCard
                  label="Tasa de actividad"
                  value={`${stats.engagementRate.toFixed(1)}%`}
                  insight={`${stats.engagementRate.toFixed(1)}% del total de usuarios ha jugado`}
                  variant={engagementVariant}
                  progress={Math.min(stats.engagementRate * 2, 100)}
                />
              </div>
            </div>

            {/* ── Time-series ───────────────────────────────────────────────── */}
            {stats.byPeriod.length > 0 && (
              <ChartCard title="Registros por período">
                <DailyTrendChart
                  data={stats.byPeriod}
                  series={[
                    {
                      key: 'count',
                      label: 'Nuevos usuarios',
                      type: 'bar',
                      color: 'var(--color-accent-green)',
                    },
                  ]}
                  height={240}
                />
              </ChartCard>
            )}

            {/* ── Canal de registro ─────────────────────────────────────────── */}
            {stats.byProvider.length > 0 && (
              <ChartCard title="Canal de registro (período)">
                <DistributionChart
                  data={stats.byProvider.map((p) => ({
                    name: p.provider === 'google' ? 'Google' : 'Email',
                    value: p.count,
                  }))}
                  height={160}
                />
              </ChartCard>
            )}
          </>
        )
      )}
    </BackofficePageShell>
  );
};
