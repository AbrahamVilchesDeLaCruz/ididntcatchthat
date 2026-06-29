import { type ReactElement } from 'react';
import { useI18n } from '@/core/i18n';
import type { HomeActionCardVM } from './home.types';
import { HomeActionGrid } from './components/HomeActionGrid';
import { HomeQuickStart } from './components/HomeQuickStart';

interface HomeComponentProps {
  roleLabel: string;
  welcomeName: string;
  quickStartSteps: [string, string, string];
  actionCards: HomeActionCardVM[];
}

export const HomeComponent = ({
  roleLabel,
  welcomeName,
  quickStartSteps,
  actionCards,
}: HomeComponentProps): ReactElement => {
  const { t } = useI18n();
  const h = t.home;

  return (
    <div className="relative mx-auto max-w-3xl space-y-10 pb-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[var(--color-brand)] opacity-[0.06] blur-[100px]"
      />

      <header className="relative">
        <p className="mb-2 text-sm text-[var(--color-text-muted)]">
          {roleLabel}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
          {h.title}, {welcomeName}
        </h1>
        <p className="mt-2 text-[var(--color-text-secondary)]">{h.subtitle}</p>
      </header>

      <HomeQuickStart title={h.quickStartTitle} steps={quickStartSteps} />
      <HomeActionGrid title={h.actionsTitle} cards={actionCards} />
    </div>
  );
};
