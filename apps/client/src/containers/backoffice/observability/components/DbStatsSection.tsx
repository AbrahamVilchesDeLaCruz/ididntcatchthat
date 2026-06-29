import { useState, type ReactElement } from 'react';
import { PeriodSelector, type StatPeriod } from './PeriodSelector';
import { DailyTrendChart } from './DailyTrendChart';
import { DistributionChart } from './DistributionChart';
import { InsightCard, InsightCardSkeleton } from './InsightCard';
import { useDbStats } from '../api/observability.api';
import type { DbStatsVM } from '../observability.types';

// ─── Skeleton ────────────────────────────────────────────────────────────────
const SectionSkeleton = (): ReactElement => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }, (_, i) => (
        <InsightCardSkeleton key={i} />
      ))}
    </div>
    <div className="h-52 rounded-xl bg-[var(--color-bg-elevated)]" />
  </div>
);

// ─── Chart card wrapper ───────────────────────────────────────────────────────
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

// ─── Games section ────────────────────────────────────────────────────────────
const GamesSubSection = ({
  data,
}: {
  data: DbStatsVM['games'];
}): ReactElement => {
  const completionVariant =
    data.completionRate >= 70
      ? 'success'
      : data.completionRate >= 50
        ? 'warning'
        : 'danger';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <InsightCard
          label="Partidas"
          value={data.total.toLocaleString('es-ES')}
          insight={`${data.total.toLocaleString('es-ES')} partidas iniciadas en el período`}
          variant="neutral"
        />
        <InsightCard
          label="Completadas"
          value={`${data.completionRate.toFixed(1)}%`}
          insight={`${data.completed} de ${data.total} partidas completadas`}
          variant={completionVariant}
          progress={data.completionRate}
          sub={`${data.completed} / ${data.total}`}
        />
        {data.byMode.length > 0 && (
          <InsightCard
            label="Modo top"
            value={data.byMode[0].mode}
            insight={`${data.byMode[0].count} partidas en modo "${data.byMode[0].mode}"`}
            variant="neutral"
          />
        )}
      </div>
      {data.byPeriod.length > 0 && (
        <ChartCard title="Partidas por período">
          <DailyTrendChart
            data={data.byPeriod}
            series={[
              {
                key: 'started',
                label: 'Iniciadas',
                type: 'bar',
                color: 'var(--color-brand)',
              },
              {
                key: 'completed',
                label: 'Completadas',
                type: 'line',
                color: 'var(--color-accent-green)',
              },
            ]}
          />
        </ChartCard>
      )}
      {data.byMode.length > 0 && (
        <ChartCard title="Distribución por modo">
          <DistributionChart
            data={data.byMode.map((m) => ({ name: m.mode, value: m.count }))}
            height={160}
          />
        </ChartCard>
      )}
      {data.topModules.length > 0 && (
        <ChartCard title="Módulos más jugados">
          <DistributionChart
            data={data.topModules
              .slice(0, 8)
              .map((m) => ({ name: m.module, value: m.count }))}
            height={160}
            horizontal
          />
        </ChartCard>
      )}
    </div>
  );
};

// ─── Users section ────────────────────────────────────────────────────────────
const UsersSubSection = ({
  data,
}: {
  data: DbStatsVM['users'];
}): ReactElement => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <InsightCard
        label="Nuevos registros"
        value={data.newRegistrations.toLocaleString('es-ES')}
        insight={`${data.newRegistrations} usuarios se registraron en este período`}
        variant="neutral"
      />
      <InsightCard
        label="Usuarios activos"
        value={data.activeUsers.toLocaleString('es-ES')}
        insight={`${data.activeUsers} usuarios con actividad reciente`}
        variant={data.activeUsers > 0 ? 'success' : 'neutral'}
      />
      {data.byProvider.length > 0 && (
        <InsightCard
          label="Proveedor top"
          value={data.byProvider[0].provider}
          insight={`${data.byProvider[0].count} registros vía ${data.byProvider[0].provider}`}
          variant="neutral"
        />
      )}
    </div>
    {data.byPeriod.length > 0 && (
      <ChartCard title="Registros por período">
        <DailyTrendChart
          data={data.byPeriod}
          series={[
            {
              key: 'count',
              label: 'Nuevos usuarios',
              type: 'bar',
              color: 'var(--color-accent-green)',
            },
          ]}
        />
      </ChartCard>
    )}
    {data.byProvider.length > 0 && (
      <ChartCard title="Canal de registro">
        <DistributionChart
          data={data.byProvider.map((p) => ({
            name: p.provider,
            value: p.count,
          }))}
          height={140}
        />
      </ChartCard>
    )}
  </div>
);

// ─── Flashcards section ───────────────────────────────────────────────────────
const FlashcardsSubSection = ({
  data,
}: {
  data: DbStatsVM['flashcards'];
}): ReactElement => {
  const audioErrorVariant =
    data.audioStatus.error > 0
      ? 'danger'
      : data.audioStatus.done > 0
        ? 'success'
        : 'neutral';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <InsightCard
          label="Total flashcards"
          value={data.total.toLocaleString('es-ES')}
          insight={`${data.total.toLocaleString('es-ES')} flashcards en el sistema`}
          variant="neutral"
        />
        <InsightCard
          label="Creadas en período"
          value={data.createdInPeriod.toLocaleString('es-ES')}
          insight={`${data.createdInPeriod} nuevas flashcards en este período`}
          variant="neutral"
        />
        <InsightCard
          label="Audio listo"
          value={`${data.audioStatus.done}`}
          insight={
            data.audioStatus.error > 0
              ? `${data.audioStatus.error} errores de audio — revisar ElevenLabs`
              : `${data.audioStatus.done} flashcards con audio generado`
          }
          variant={audioErrorVariant}
          sub={`pendiente: ${data.audioStatus.pending} · error: ${data.audioStatus.error}`}
        />
      </div>
      {data.byPeriod.length > 0 && (
        <ChartCard title="Flashcards creadas por período">
          <DailyTrendChart
            data={data.byPeriod}
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
      {data.byCategory.length > 0 && (
        <ChartCard title="Por categoría">
          <DistributionChart
            data={data.byCategory.map((c) => ({
              name: c.category,
              value: c.count,
            }))}
            height={160}
            horizontal
          />
        </ChartCard>
      )}
    </div>
  );
};

// ─── Page Views section ───────────────────────────────────────────────────────
const PageViewsSubSection = ({
  data,
}: {
  data: DbStatsVM['pageViews'];
}): ReactElement => {
  const conversionVariant =
    data.conversionRate >= 10
      ? 'success'
      : data.conversionRate >= 3
        ? 'warning'
        : 'neutral';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <InsightCard
          label="Visitas totales"
          value={data.total.toLocaleString('es-ES')}
          insight={`${data.total.toLocaleString('es-ES')} páginas vistas en el período`}
          variant="neutral"
        />
        <InsightCard
          label="Visitantes únicos"
          value={data.uniqueVisitors.toLocaleString('es-ES')}
          insight={`${data.uniqueVisitors} visitantes únicos (por sesión de navegador)`}
          variant="neutral"
        />
        <InsightCard
          label="Conversión"
          value={`${data.conversionRate.toFixed(1)}%`}
          insight={`${data.registeredVisitors} visitantes tienen cuenta registrada`}
          variant={conversionVariant}
          progress={Math.min(data.conversionRate * 5, 100)}
        />
        {data.topPages.length > 0 && (
          <InsightCard
            label="Página top"
            value={data.topPages[0].path}
            insight={`${data.topPages[0].views} visitas a la ruta más popular`}
            variant="neutral"
          />
        )}
      </div>
      {data.byPeriod.length > 0 && (
        <ChartCard title="Visitas por período">
          <DailyTrendChart
            data={data.byPeriod}
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
      {data.topPages.length > 0 && (
        <ChartCard title="Páginas más visitadas">
          <DistributionChart
            data={data.topPages
              .slice(0, 8)
              .map((p) => ({ name: p.path, value: p.views }))}
            height={Math.max(200, data.topPages.slice(0, 8).length * 36)}
            horizontal
          />
        </ChartCard>
      )}
    </div>
  );
};

// ─── Sub-tabs ─────────────────────────────────────────────────────────────────
type SubTab = 'visitas' | 'partidas' | 'usuarios' | 'contenido';

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: 'visitas', label: 'Visitas web' },
  { key: 'partidas', label: 'Partidas' },
  { key: 'usuarios', label: 'Usuarios' },
  { key: 'contenido', label: 'Contenido' },
];

// ─── Main DbStatsSection ──────────────────────────────────────────────────────
export const DbStatsSection = (): ReactElement => {
  const [period, setPeriod] = useState<StatPeriod>('7d');
  const [subTab, setSubTab] = useState<SubTab>('visitas');

  const { data, isLoading, isError } = useDbStats(period);

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-0.5">
          {SUB_TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setSubTab(key);
              }}
              className={[
                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                subTab === key
                  ? 'bg-[var(--color-bg-card)] text-[var(--color-text-primary)] shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {/* Content */}
      {isLoading && <SectionSkeleton />}
      {isError && (
        <p className="text-sm text-[var(--color-text-secondary)] text-center py-8">
          Error cargando estadísticas de base de datos.
        </p>
      )}
      {!isLoading && !isError && data && (
        <>
          {subTab === 'visitas' && (
            <PageViewsSubSection data={data.pageViews} />
          )}
          {subTab === 'partidas' && <GamesSubSection data={data.games} />}
          {subTab === 'usuarios' && <UsersSubSection data={data.users} />}
          {subTab === 'contenido' && (
            <FlashcardsSubSection data={data.flashcards} />
          )}
        </>
      )}
    </div>
  );
};
