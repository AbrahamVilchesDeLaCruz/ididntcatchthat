import { type ReactElement } from 'react';
import { Mail } from 'lucide-react';
import { useI18n } from '@/core/i18n';

export const LandingNotify = (): ReactElement => {
  const { t } = useI18n();
  const n = t.landing.notify;

  return (
    <section id="notify" className="px-5 py-20">
      <div className="mx-auto max-w-xl">
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-brand-dim)] bg-[var(--color-bg-elevated)] p-8 text-center sm:p-12">
          {/* Background glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 translate-y-1/2 rounded-full bg-[var(--color-brand)] opacity-[0.12] blur-[80px]"
          />

          <div className="relative">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[var(--color-brand)]">
              {n.sectionLabel}
            </p>
            <h2 className="mb-3 text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">
              {n.headline}
            </h2>
            <p className="mb-8 text-[var(--color-text-secondary)]">
              {n.subheadline}
            </p>

            <form
              className="flex flex-col gap-3 sm:flex-row"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder={n.inputPlaceholder}
                aria-label="Email address"
                className="flex-1 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg-base)] px-5 py-3 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)] focus:ring-offset-0"
              />
              <button
                type="submit"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--color-brand)] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
              >
                <Mail size={15} strokeWidth={2} />
                {n.ctaButton}
              </button>
            </form>

            <p className="mt-4 text-xs text-[var(--color-text-muted)]">
              {n.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
