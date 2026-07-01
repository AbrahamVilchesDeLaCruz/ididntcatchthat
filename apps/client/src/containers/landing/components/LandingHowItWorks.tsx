import { type ReactElement } from 'react';
import { Eye, Headphones, Mic, ThumbsUp } from 'lucide-react';
import { useI18n } from '@/core/i18n';

const stepIcons = [Eye, ThumbsUp, Headphones, Mic] as const;

const stepAccents = [
  'var(--color-brand)',
  'var(--color-brand-light)',
  'var(--color-accent-green)',
  'var(--color-accent-green)',
] as const;

export const LandingHowItWorks = (): ReactElement => {
  const { t } = useI18n();
  const h = t.landing.howItWorks;

  return (
    <section
      id="how-it-works"
      className="border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]/30 px-5 py-20"
    >
      <div className="mx-auto max-w-3xl">
        <p className="mb-3 text-center text-sm font-semibold uppercase tracking-widest text-[var(--color-brand)]">
          {h.sectionLabel}
        </p>
        <h2 className="mb-4 text-center text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">
          {h.headline}
        </h2>
        <p className="mb-14 text-center text-[var(--color-text-secondary)]">
          {h.subheadline}
        </p>

        <div className="relative flex flex-col gap-0">
          {/* Vertical line */}
          <div
            aria-hidden
            className="absolute left-[19px] top-8 h-[calc(100%-4rem)] w-px bg-gradient-to-b from-[var(--color-brand)] to-transparent"
          />

          {h.steps.map((step, i) => {
            const Icon = stepIcons[i];
            return (
              <div
                key={step.number}
                className="relative flex gap-5 pb-10 last:pb-0"
              >
                <div
                  className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)]"
                  style={{ color: stepAccents[i] }}
                >
                  <Icon size={16} strokeWidth={2} />
                </div>
                <div className="pt-1.5">
                  <h3 className="mb-1 text-base font-semibold text-[var(--color-text-primary)]">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
