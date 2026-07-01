import { type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/core/i18n';

interface LandingFinalCtaProps {
  onPlay: () => void;
}

export const LandingFinalCta = ({
  onPlay,
}: LandingFinalCtaProps): ReactElement => {
  const { t } = useI18n();
  const c = t.landing.finalCta;

  return (
    <section
      id="get-started"
      className="scroll-mt-[4.5rem] border-t border-[var(--color-border)] px-5 py-20"
    >
      <div className="mx-auto max-w-xl">
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-brand-dim)] bg-[var(--color-bg-elevated)] p-8 text-center sm:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 translate-y-1/2 rounded-full bg-[var(--color-brand)] opacity-[0.12] blur-[80px]"
          />

          <div className="relative">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[var(--color-brand)]">
              {c.sectionLabel}
            </p>
            <h2 className="mb-3 text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">
              {c.headline}
            </h2>
            <p className="mb-8 text-[var(--color-text-secondary)]">
              {c.subheadline}
            </p>

            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/auth/register"
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--color-brand)] px-7 py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
              >
                {c.ctaSignUp}
              </Link>
              <button
                type="button"
                onClick={onPlay}
                className="inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--color-border-strong)] px-7 py-3.5 text-base font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-text-primary)]"
              >
                {c.ctaPlay}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
