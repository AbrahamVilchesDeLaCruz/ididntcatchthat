import { type MouseEvent, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { BrandWordmark } from '@/common/components/BrandWordmark';
import { ThemeToggle } from '@/common/components/ThemeToggle';
import { LocaleToggle } from '@/common/components/LocaleToggle';
import { scrollToLandingSection } from '@/containers/landing/landingScroll';
import { useI18n } from '@/core/i18n';
import { useAuthStore } from '@/core/store/auth.store';
import { DEFAULT_AUTHENTICATED_HOME } from '@/core/auth/postLoginRedirect';

const handleSectionNav =
  (sectionId: string) =>
  (event: MouseEvent<HTMLAnchorElement>): void => {
    event.preventDefault();
    scrollToLandingSection(sectionId);
  };

export const LandingHeader = (): ReactElement => {
  const { t } = useI18n();
  const h = t.landing.hero;
  const f = t.landing.footer;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const sectionLinkClass =
    'rounded-full px-3 py-1.5 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]';

  const authLinkClass =
    'rounded-full border border-[var(--color-border-strong)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-text-primary)]';

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--color-border)]/70 bg-[var(--color-bg-base)]/90 backdrop-blur-md">
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:px-6">
        <a
          href="#top"
          onClick={handleSectionNav('top')}
          className="min-w-0 justify-self-start transition-opacity hover:opacity-90"
          aria-label="Back to top"
        >
          <BrandWordmark className="block truncate text-sm leading-tight sm:text-base md:text-lg" />
        </a>

        <nav
          className="hidden items-center justify-center gap-1 md:flex"
          aria-label="Landing sections"
        >
          <a
            href="#how-it-works"
            onClick={handleSectionNav('how-it-works')}
            className={sectionLinkClass}
          >
            {f.navHowItWorks}
          </a>
          <a
            href="#get-started"
            onClick={handleSectionNav('get-started')}
            className={sectionLinkClass}
          >
            {f.navGetStarted}
          </a>
        </nav>

        <div className="flex shrink-0 items-center justify-end gap-2 md:col-start-3">
          {isAuthenticated ? (
            <Link to={DEFAULT_AUTHENTICATED_HOME} className={authLinkClass}>
              {t.home.navApp}
            </Link>
          ) : (
            <>
              <Link
                to="/auth/login"
                className={`${authLinkClass} hidden sm:inline-flex`}
              >
                {h.navLogin}
              </Link>
              <Link
                to="/auth/register"
                className="rounded-full bg-[var(--color-brand)] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 sm:px-4 sm:text-sm"
              >
                {h.navRegister}
              </Link>
            </>
          )}

          <ThemeToggle variant="icon" />
          <LocaleToggle variant="icon" />
        </div>
      </div>
    </header>
  );
};
