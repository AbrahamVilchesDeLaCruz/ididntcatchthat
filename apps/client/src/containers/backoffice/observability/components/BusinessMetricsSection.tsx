import { type ReactElement } from 'react';
import { type BusinessMetrics } from '../utils/parseMetrics';
import {
  InsightCard,
  InsightCardSkeleton,
  type InsightVariant,
} from './InsightCard';

interface BusinessMetricsSectionProps {
  business: BusinessMetrics | null;
  isLoading: boolean;
}

export const BusinessMetricsSection = ({
  business,
  isLoading,
}: BusinessMetricsSectionProps): ReactElement => {
  if (isLoading || !business) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 6 }, (_, i) => (
          <InsightCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const noData =
    business.gamesStarted === 0 &&
    business.flashcardsCreated === 0 &&
    business.totalLogins === 0;

  if (noData) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-6 py-12 text-center">
        <p className="text-[var(--color-text-secondary)] text-sm">
          Sin métricas de negocio — los contadores se incrementan cuando los
          usuarios interactúan con la app.
        </p>
      </div>
    );
  }

  const completionVariant: InsightVariant =
    business.completionRate === null
      ? 'neutral'
      : business.completionRate >= 70
        ? 'success'
        : business.completionRate >= 50
          ? 'warning'
          : 'danger';

  const completionInsight =
    business.completionRate === null
      ? 'Sin partidas iniciadas aún'
      : business.completionRate >= 70
        ? `${business.completionRate.toFixed(0)}% de partidas iniciadas llegan al final`
        : business.completionRate >= 50
          ? `${business.completionRate.toFixed(0)}% de completado — hay margen de mejora`
          : `Solo el ${business.completionRate.toFixed(0)}% de partidas se completan — revisar UX`;

  const audioVariant: InsightVariant =
    business.audioErrors > 0 ? 'danger' : 'success';
  const audioInsight =
    business.audioErrors > 0
      ? `${business.audioErrors} fallos en generación de audio — revisar ElevenLabs`
      : business.audioGenerated > 0
        ? `${business.audioGenerated} archivos de audio generados sin errores`
        : 'Sin actividad de audio registrada';

  const googleLogins = business.loginsByProvider['google'] ?? 0;
  const emailLogins = business.loginsByProvider['email'] ?? 0;
  const totalLogins = business.totalLogins;
  const googleLoginPct =
    totalLogins > 0 ? ((googleLogins / totalLogins) * 100).toFixed(0) : '0';
  const loginInsight =
    totalLogins === 0
      ? 'Sin logins registrados desde el arranque del servidor'
      : `${totalLogins} accesos — ${googleLoginPct}% mediante Google`;

  const googleRegs = business.registrationsByProvider['google'] ?? 0;
  const totalRegs = business.totalRegistrations;
  const regInsight =
    totalRegs === 0
      ? 'Sin nuevos registros desde el arranque del servidor'
      : googleRegs > 0
        ? `${totalRegs} registros — ${googleRegs} vía Google OAuth`
        : `${totalRegs} nuevos registros desde el arranque`;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <InsightCard
        label="Partidas iniciadas"
        value={business.gamesStarted.toLocaleString('es-ES')}
        insight={`${business.gamesStarted.toLocaleString('es-ES')} partidas iniciadas desde el arranque`}
        variant="neutral"
      />

      <InsightCard
        label="Tasa de completado"
        value={
          business.completionRate !== null
            ? `${business.completionRate.toFixed(1)}%`
            : '—'
        }
        insight={completionInsight}
        variant={completionVariant}
        progress={business.completionRate ?? undefined}
        sub={`${business.gamesCompleted} / ${business.gamesStarted} partidas`}
      />

      {business.flashcardsCreated > 0 && (
        <InsightCard
          label="Flashcards creadas"
          value={business.flashcardsCreated.toLocaleString('es-ES')}
          insight={`${business.flashcardsCreated.toLocaleString('es-ES')} flashcards gestionadas`}
          variant="neutral"
        />
      )}

      <InsightCard
        label="Audio generado"
        value={business.audioGenerated.toLocaleString('es-ES')}
        insight={audioInsight}
        variant={audioVariant}
        sub={
          business.audioErrors > 0
            ? `${business.audioErrors} errores`
            : undefined
        }
      />

      <InsightCard
        label="Logins"
        value={totalLogins.toLocaleString('es-ES')}
        insight={loginInsight}
        variant="neutral"
        sub={
          totalLogins > 0
            ? `Google: ${googleLogins} · email: ${emailLogins}`
            : undefined
        }
      />

      <InsightCard
        label="Registros"
        value={totalRegs.toLocaleString('es-ES')}
        insight={regInsight}
        variant="neutral"
      />
    </div>
  );
};
