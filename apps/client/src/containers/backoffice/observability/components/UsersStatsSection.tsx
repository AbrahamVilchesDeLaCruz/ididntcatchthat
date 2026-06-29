import { type ReactElement } from 'react';
import type { UserStatsVM } from '../observability.types';
import {
  InsightCard,
  InsightCardSkeleton,
  type InsightVariant,
} from './InsightCard';

interface UsersStatsSectionProps {
  stats: UserStatsVM | null;
  isLoading: boolean;
  isError: boolean;
}

export const UsersStatsSection = ({
  stats,
  isLoading,
  isError,
}: UsersStatsSectionProps): ReactElement => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }, (_, i) => (
            <InsightCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-6 py-12 text-center">
        <p className="text-[var(--color-text-secondary)] text-sm">
          No se han podido cargar los datos de usuarios.
        </p>
      </div>
    );
  }

  const engVariant: InsightVariant =
    stats.engagementRate >= 50
      ? 'success'
      : stats.engagementRate >= 25
        ? 'warning'
        : 'danger';

  const engInsight =
    stats.engagementRate >= 50
      ? `${stats.engagementRate.toFixed(0)}% de usuarios activos en los últimos 30 días`
      : stats.engagementRate >= 25
        ? `Solo el ${stats.engagementRate.toFixed(0)}% han estado activos este mes`
        : `Baja actividad — solo el ${stats.engagementRate.toFixed(0)}% activos este mes`;

  const googlePct =
    stats.totalUsers > 0
      ? ((stats.googleUsers / stats.totalUsers) * 100).toFixed(0)
      : '0';
  const googleVariant: InsightVariant = 'neutral';
  const googleInsight =
    stats.totalUsers === 0
      ? 'Sin usuarios registrados'
      : Number(googlePct) >= 80
        ? `${googlePct}% de usuarios entran mediante Google OAuth`
        : Number(googlePct) >= 50
          ? `${googlePct}% prefieren Google OAuth`
          : `${googlePct}% con Google — mayoría con registro manual`;

  const newUsersVariant: InsightVariant =
    stats.newUsersLast7Days > 0 ? 'success' : 'neutral';

  const activeVariant: InsightVariant =
    stats.activeUsersLast7Days > stats.totalUsers * 0.3 ? 'success' : 'warning';

  const streakVariant: InsightVariant =
    stats.usersWithStreak > stats.totalUsers * 0.2 ? 'success' : 'neutral';

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-2.5 text-xs text-[var(--color-text-muted)]">
        Los datos de canal se basan en el proveedor de registro (
        <code className="font-mono">oauthProvider</code>), no en analítica de
        tráfico de sesión.
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <InsightCard
          label="Usuarios totales"
          value={stats.totalUsers.toLocaleString('es-ES')}
          insight={`${stats.totalUsers.toLocaleString('es-ES')} usuarios registrados con rol user`}
          variant="neutral"
        />

        <InsightCard
          label="Nuevos esta semana"
          value={String(stats.newUsersLast7Days)}
          insight={
            stats.newUsersLast7Days > 0
              ? `${stats.newUsersLast7Days} nuevos registros en los últimos 7 días`
              : 'Sin nuevos registros esta semana'
          }
          variant={newUsersVariant}
          sub={`Últimos 30 días: ${stats.newUsersLast30Days}`}
        />

        <InsightCard
          label="Activos 7 días"
          value={String(stats.activeUsersLast7Days)}
          insight={`${stats.activeUsersLast7Days} usuarios han tenido actividad esta semana`}
          variant={activeVariant}
          sub={`Últimos 30 días: ${stats.activeUsersLast30Days}`}
        />

        <InsightCard
          label="Engagement 30d"
          value={`${stats.engagementRate.toFixed(1)}%`}
          insight={engInsight}
          variant={engVariant}
          progress={stats.engagementRate}
          sub={`${stats.activeUsersLast30Days} / ${stats.totalUsers} usuarios`}
        />

        <InsightCard
          label="Canal Google"
          value={`${googlePct}%`}
          insight={googleInsight}
          variant={googleVariant}
          progress={Number(googlePct)}
          sub={`Google: ${stats.googleUsers} · email: ${stats.emailUsers}`}
        />

        <InsightCard
          label="Registro manual"
          value={String(stats.emailUsers)}
          insight={`${stats.emailUsers} usuarios con registro manual por email`}
          variant="neutral"
        />

        <InsightCard
          label="Con racha activa"
          value={String(stats.usersWithStreak)}
          insight={
            stats.usersWithStreak > 0
              ? `${stats.usersWithStreak} usuarios mantienen una racha activa hoy`
              : 'Ningún usuario mantiene racha activa hoy'
          }
          variant={streakVariant}
        />

        <InsightCard
          label="Racha media máx."
          value={`${stats.avgLongestStreak.toFixed(1)} días`}
          insight={`La racha media máxima histórica es de ${stats.avgLongestStreak.toFixed(1)} días`}
          variant="neutral"
        />
      </div>
    </div>
  );
};
