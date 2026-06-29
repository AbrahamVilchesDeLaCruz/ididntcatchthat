import { type ReactElement } from 'react';

interface HomeQuickStartProps {
  title: string;
  steps: [string, string, string];
}

export const HomeQuickStart = ({
  title,
  steps,
}: HomeQuickStartProps): ReactElement => (
  <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
      {title}
    </h2>
    <ol className="space-y-4">
      {steps.map((step, index) => (
        <li key={step} className="flex gap-3">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-dim)] text-xs font-semibold text-[var(--color-brand)]">
            {index + 1}
          </span>
          <p className="pt-0.5 text-sm text-[var(--color-text-secondary)]">
            {step}
          </p>
        </li>
      ))}
    </ol>
  </section>
);
