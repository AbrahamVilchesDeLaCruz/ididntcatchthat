import { type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { scrollToLandingSection } from '@/containers/landing/landingScroll';
import { useI18n } from '@/core/i18n';
import { useCurrentUser } from '@/core/auth/useCurrentUser';

interface LandingHeroProps {
  onPlay: () => void;
}

export const LandingHero = ({ onPlay }: LandingHeroProps): ReactElement => {
  const { t } = useI18n();
  const h = t.landing.hero;
  const { canStudy } = useCurrentUser();

  const studyLink = canStudy
    ? '/study'
    : { pathname: '/auth/login', state: { returnTo: '/study' } };

  const tertiaryLinkClass =
    'text-sm font-medium text-[var(--color-text-muted)] underline-offset-4 transition-colors hover:text-[var(--color-text-primary)] hover:underline';

  return (
    <section
      id="top"
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-5 pb-16 pt-[max(6rem,calc(env(safe-area-inset-top,0px)+4rem))] text-center sm:pt-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="h-[500px] w-[500px] rounded-full bg-[var(--color-brand)] opacity-[0.08] blur-[120px]" />
      </div>

      <p className="relative mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-4 py-1.5 text-sm text-[var(--color-text-secondary)]">
        <span className="size-2 animate-pulse rounded-full bg-[var(--color-accent-green)]" />
        {h.badge}
      </p>

      <h1 className="relative mb-4 max-w-[22ch] text-4xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-5xl md:text-6xl">
        {h.headline}{' '}
        <span className="bg-gradient-to-r from-[var(--color-brand-light)] to-[var(--color-accent-green)] bg-clip-text text-transparent">
          {h.headlineAccent}
        </span>
      </h1>

      <p className="relative mb-10 max-w-[42ch] text-lg text-[var(--color-text-secondary)] sm:text-xl">
        {h.subheadline}
      </p>

      <div className="relative mx-auto flex w-full max-w-[280px] flex-col items-stretch gap-2 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-3">
        <button
          type="button"
          onClick={onPlay}
          className="inline-flex items-center justify-center rounded-full bg-[var(--color-brand)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_32px_-14px_var(--color-brand)] transition-opacity hover:opacity-90 active:scale-[0.98] sm:px-7 sm:py-3 sm:text-base"
        >
          {h.ctaPlay}
        </button>
        <Link
          to="/auth/register"
          className="inline-flex items-center justify-center rounded-full border border-[var(--color-brand)] px-5 py-2.5 text-sm font-semibold text-[var(--color-brand-light)] transition-colors hover:bg-[var(--color-brand-dim)] sm:border-2 sm:px-7 sm:py-3 sm:text-base"
        >
          {h.ctaSignUp}
        </Link>
      </div>

      <div className="relative mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <Link to={studyLink} className={tertiaryLinkClass}>
          {h.ctaStudy}
        </Link>
        <span className="text-[var(--color-text-muted)]" aria-hidden>
          ·
        </span>
        <a
          href="#how-it-works"
          onClick={(e) => {
            e.preventDefault();
            scrollToLandingSection('how-it-works');
          }}
          className={tertiaryLinkClass}
        >
          {h.ctaHowItWorks}
        </a>
        <span className="text-[var(--color-text-muted)]" aria-hidden>
          ·
        </span>
        <a
          href="#get-started"
          onClick={(e) => {
            e.preventDefault();
            scrollToLandingSection('get-started');
          }}
          className={tertiaryLinkClass}
        >
          {h.ctaGetStarted}
        </a>
      </div>

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
