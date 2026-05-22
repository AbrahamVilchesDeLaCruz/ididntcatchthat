import { type ReactElement } from 'react';
import { ChevronDown } from 'lucide-react';
import { useI18n } from '@/core/i18n';

export const LandingHero = (): ReactElement => {
  const { t, locale, toggleLocale } = useI18n();
  const h = t.landing.hero;

  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-5 py-20 text-center">
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="h-[500px] w-[500px] rounded-full bg-[var(--color-brand)] opacity-[0.08] blur-[120px]" />
      </div>

      {/* Language toggle — top right */}
      <div className="absolute right-5 top-5 z-10">
        <button
          onClick={toggleLocale}
          className="flex items-center gap-1.5 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-text-primary)]"
          aria-label="Switch language"
        >
          <span
            className={
              locale === 'en'
                ? 'text-[var(--color-text-primary)]'
                : 'opacity-40'
            }
          >
            EN
          </span>
          <span className="text-[var(--color-text-muted)]">/</span>
          <span
            className={
              locale === 'es'
                ? 'text-[var(--color-text-primary)]'
                : 'opacity-40'
            }
          >
            ES
          </span>
        </button>
      </div>

      {/* Logo — wordmark */}
      {/*  <div className="relative mb-3 w-2/3 sm:w-1/2 md:w-2/5">
        <img
          src="/logo.idct-cropped.png"
          alt="ididntcatchthat"
          className="w-full"
          draggable={false}
        />
      </div> */}

      {/* Badge */}
      <div className="relative mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-4 py-1.5 text-sm text-[var(--color-text-secondary)]">
        <span className="size-2 animate-pulse rounded-full bg-[var(--color-accent-green)]" />
        {h.badge}
      </div>

      {/* Heading */}
      <h1 className="relative mb-4 max-w-[22ch] text-4xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-5xl md:text-6xl">
        {h.headline}{' '}
        <span className="bg-gradient-to-r from-[var(--color-brand-light)] to-[var(--color-accent-green)] bg-clip-text text-transparent">
          {h.headlineAccent}
        </span>
      </h1>

      {/* Sub */}
      <p className="relative mb-10 max-w-[40ch] text-lg text-[var(--color-text-secondary)] sm:text-xl">
        {h.subheadline}
      </p>

      {/* CTA */}
      <div className="relative flex flex-col items-center gap-3 sm:flex-row">
        <a
          href="#notify"
          className="inline-flex items-center justify-center rounded-full bg-[var(--color-brand)] px-7 py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
        >
          {h.ctaPrimary}
        </a>
        <a
          href="#how-it-works"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-border-strong)] px-7 py-3.5 text-base font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-text-primary)]"
        >
          {h.ctaSecondary}
          <ChevronDown size={16} strokeWidth={2} />
        </a>
      </div>

      {/* Phonetic decoration */}
      <div
        aria-hidden
        className="relative mt-14 flex flex-wrap justify-center gap-3 opacity-30"
      >
        {['/θ/', '/ð/', '/ɪ/', '/æ/', '/ʌ/', '/ɒ/', '/ŋ/'].map((symbol) => (
          <span
            key={symbol}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-1.5 font-mono text-sm text-[var(--color-text-secondary)]"
          >
            {symbol}
          </span>
        ))}
      </div>
    </section>
  );
};
