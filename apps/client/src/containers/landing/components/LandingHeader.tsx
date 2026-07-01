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
  (event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>): void => {
    event.preventDefault();
    scrollToLandingSection(sectionId);
  };

export const LandingHeader = (): ReactElement => {
  const { t } = useI18n();
  const h = t.landing.hero;
  const f = t.landing.footer;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const navLinkClass =
    'text-xs sm:text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]';

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--color-border)]/70 bg-[var(--color-bg-base)]/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-5">
        <a
          href="#top"
          onClick={handleSectionNav('top')}
          className="shrink-0 transition-opacity hover:opacity-90"
          aria-label="Back to top"
        >
          <BrandWordmark className="text-base sm:text-lg" />
        </a>

        <nav
          className="flex min-w-0 items-center gap-2 overflow-x-auto sm:gap-4"
          aria-label="Landing sections"
        >
          <a
            href="#how-it-works"
            onClick={handleSectionNav('how-it-works')}
            className={`${navLinkClass} whitespace-nowrap`}
          >
            {f.navHowItWorks}
          </a>
          <a
            href="#get-started"
            onClick={handleSectionNav('get-started')}
            className={`${navLinkClass} whitespace-nowrap`}
          >
            {f.navGetStarted}
          </a>
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          {isAuthenticated ? (
            <Link
              to={DEFAULT_AUTHENTICATED_HOME}
              className="hidden rounded-full border border-[var(--color-border-strong)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-brand)] sm:inline-flex"
            >
              {t.home.navApp}
            </Link>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="hidden rounded-full border border-[var(--color-border-strong)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-brand)] sm:inline-flex"
              >
                {h.navLogin}
              </Link>
              <Link
                to="/auth/register"
                className="rounded-full bg-[var(--color-brand)] px-2.5 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 sm:px-3"
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
