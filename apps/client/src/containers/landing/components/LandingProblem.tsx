import { type ReactElement } from 'react';
import { ArrowRight, BookOpen, Target } from 'lucide-react';
import { useI18n } from '@/core/i18n';

export const LandingProblem = (): ReactElement => {
  const { t } = useI18n();
  const p = t.landing.problem;

  return (
    <section className="border-t border-[var(--color-border)] px-5 py-20">
      <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2 lg:items-start">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[var(--color-brand)]">
            {p.sectionLabel}
          </p>
          <h2 className="mb-4 text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">
            {p.headline}
          </h2>
          <p className="text-[var(--color-text-secondary)]">{p.subheadline}</p>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 opacity-60">
              <div className="mb-3">
                <BookOpen
                  size={24}
                  className="text-[var(--color-text-muted)]"
                />
              </div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                {p.duolingoLabel}
              </p>
              <p className="text-[var(--color-text-muted)] line-through">
                {p.duolingoDescription}
              </p>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-[var(--color-brand-dim)] bg-[var(--color-bg-elevated)] p-6">
              <div className="mb-3">
                <Target size={24} className="text-[var(--color-brand-light)]" />
              </div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--color-brand-light)]">
                {p.weTeachLabel}
              </p>
              <p className="text-[var(--color-text-primary)]">
                {p.weTeachDescription}
              </p>
            </div>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
            <p className="mb-1 text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
              {p.exampleLabel}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {p.exampleWrittenLabel}
                </p>
                <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                  {p.exampleWritten}
                </p>
              </div>
              <ArrowRight
                size={16}
                className="hidden shrink-0 text-[var(--color-text-muted)] sm:block"
              />
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {p.exampleNativeLabel}
                </p>
                <p className="text-lg font-semibold text-[var(--color-accent-green)]">
                  {p.exampleNative}
                </p>
              </div>
              <span className="sm:ml-auto rounded-full bg-[var(--color-accent-green-dim)] px-3 py-1 text-xs font-medium text-[var(--color-accent-green)]">
                {p.exampleTag}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
