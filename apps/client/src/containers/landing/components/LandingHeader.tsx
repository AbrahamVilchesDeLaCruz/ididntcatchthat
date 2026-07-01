import { type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { BrandWordmark } from '@/common/components/BrandWordmark';
import { ThemeToggle } from '@/common/components/ThemeToggle';
import { LocaleToggle } from '@/common/components/LocaleToggle';
import { useI18n } from '@/core/i18n';
import { useAuthStore } from '@/core/store/auth.store';
import { DEFAULT_AUTHENTICATED_HOME } from '@/core/auth/postLoginRedirect';

export const LandingHeader = (): ReactElement => {
  const { t } = useI18n();
  const h = t.landing.hero;
  const f = t.landing.footer;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const navLinkClass =
    'text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]';

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--color-border)]/70 bg-[var(--color-bg-base)]/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5">
        <a
          href="#top"
          className="shrink-0 transition-opacity hover:opacity-90"
          aria-label="Back to top"
        >
          <BrandWordmark className="text-base sm:text-lg" />
        </a>

        <nav
          className="hidden items-center gap-5 md:flex"
          aria-label="Landing sections"
        >
          <a href="#how-it-works" className={navLinkClass}>
            {f.navHowItWorks}
          </a>
          <a href="#get-started" className={navLinkClass}>
            {f.navGetStarted}
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
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
                className="rounded-full bg-[var(--color-brand)] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
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
