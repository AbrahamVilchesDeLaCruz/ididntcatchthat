import { type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { scrollToLandingSection } from '@/containers/landing/landingScroll';
import { useI18n } from '@/core/i18n';

export const LandingFooter = (): ReactElement => {
  const { t } = useI18n();
  const f = t.landing.footer;

  const linkClass =
    'text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]';

  return (
    <footer className="border-t border-[var(--color-border)] px-5 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
        <nav
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
          aria-label="Footer"
        >
          <a
            href="#how-it-works"
            onClick={(e) => {
              e.preventDefault();
              scrollToLandingSection('how-it-works');
            }}
            className={linkClass}
          >
            {f.navHowItWorks}
          </a>
          <a
            href="#get-started"
            onClick={(e) => {
              e.preventDefault();
              scrollToLandingSection('get-started');
            }}
            className={linkClass}
          >
            {f.navGetStarted}
          </a>
          <Link to="/auth/login" className={linkClass}>
            {f.navLogin}
          </Link>
          <Link to="/auth/register" className={linkClass}>
            {f.navRegister}
          </Link>
        </nav>

        <p className="text-sm text-[var(--color-text-muted)]">
          <span className="font-medium text-[var(--color-text-secondary)]">
            ididntcatchthat.com
          </span>
          {' · '}
          {f.tagline}
        </p>

        <p className="text-xs text-[var(--color-text-muted)]">{f.accents}</p>
      </div>
    </footer>
  );
};
