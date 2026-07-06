import { type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/core/i18n';
import {
  guestSessionAccuracy,
  useGuestStatsStore,
} from '@/core/store/guestStats.store';

interface GuestStatsPanelProps {
  onRegister: () => void;
}

export const GuestStatsPanel = ({
  onRegister,
}: GuestStatsPanelProps): ReactElement => {
  const { t } = useI18n();
  const g = t.stats.guest;
  const gamesPlayed = useGuestStatsStore((s) => s.gamesPlayed);
  const totalAttempts = useGuestStatsStore((s) => s.totalAttempts);
  const failedCount = useGuestStatsStore((s) => s.failedFlashcardIds.length);
  const accuracy = guestSessionAccuracy(useGuestStatsStore.getState());

  if (gamesPlayed === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          {g.emptyTitle}
        </h1>
        <p className="max-w-md text-sm text-[var(--color-text-secondary)]">
          {g.emptyBody}
        </p>
        <Link
          to="/game"
          className="rounded-full bg-[var(--color-brand)] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          {g.emptyPlayCta}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          {g.title}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {g.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <GuestKpi label={g.games} value={String(gamesPlayed)} />
        <GuestKpi label={g.attempts} value={String(totalAttempts)} />
        <GuestKpi label={g.accuracy} value={`${accuracy}%`} />
        <GuestKpi label={g.failed} value={String(failedCount)} />
      </div>

      <div className="rounded-xl border border-[var(--color-brand-dim)] bg-[var(--color-bg-elevated)] p-6 text-center">
        <p className="mb-1 text-sm font-semibold text-[var(--color-text-primary)]">
          {g.registerTitle}
        </p>
        <p className="mb-4 text-xs text-[var(--color-text-muted)]">
          {g.registerHint}
        </p>
        <button
          type="button"
          onClick={onRegister}
          className="rounded-full bg-[var(--color-brand)] px-6 py-3 text-sm font-semibold text-white"
        >
          {g.registerCta}
        </button>
      </div>
    </div>
  );
};

const GuestKpi = ({
  label,
  value,
}: {
  label: string;
  value: string;
}): ReactElement => (
  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
    <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
    <p className="mt-1 text-2xl font-bold text-[var(--color-text-primary)]">
      {value}
    </p>
  </div>
);
