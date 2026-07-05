import { type MouseEvent, type ReactElement } from 'react';
import { ArrowRight, Link2, Route } from 'lucide-react';
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
  const nav = t.landing.header;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const authLinkClass =
    'rounded-full border border-[var(--color-border-strong)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-text-primary)]';

  return (
    <header className="safe-top fixed inset-x-0 top-0 z-50 border-b border-[var(--color-border)]/70 bg-[var(--color-bg-base)]/90 backdrop-blur-md">
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:px-6">
        <a
          href="#top"
          onClick={handleSectionNav('top')}
          className="min-w-0 justify-self-start transition-opacity hover:opacity-90"
          aria-label={nav.backToTop}
        >
          <BrandWordmark className="block truncate text-sm leading-tight sm:text-base md:text-lg" />
        </a>

        <nav
          className="hidden items-center justify-center md:flex"
          aria-label="Landing sections"
        >
          <div className="flex items-center rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] p-1">
            <a
              href="#how-it-works"
              onClick={handleSectionNav('how-it-works')}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)] sm:px-4 sm:text-sm"
            >
              <Route
                size={14}
                strokeWidth={2}
                className="shrink-0 text-[var(--color-brand-light)]"
                aria-hidden
              />
              {nav.explore}
            </a>
            <a
              href="#get-started"
              onClick={handleSectionNav('get-started')}
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-dim)] px-3 py-1.5 text-xs font-semibold text-[var(--color-brand-light)] transition-opacity hover:opacity-90 sm:px-4 sm:text-sm"
            >
              <Link2
                size={14}
                strokeWidth={2}
                className="shrink-0"
                aria-hidden
              />
              {nav.start}
              <ArrowRight
                size={14}
                strokeWidth={2}
                className="shrink-0 opacity-80"
                aria-hidden
              />
            </a>
          </div>
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

      <nav
        className="flex gap-2 overflow-x-auto border-t border-[var(--color-border)]/70 px-4 py-2 md:hidden [&::-webkit-scrollbar]:hidden"
        aria-label="Landing sections"
      >
        <a
          href="#how-it-works"
          onClick={handleSectionNav('how-it-works')}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--color-border-strong)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)]"
        >
          <Route
            size={14}
            strokeWidth={2}
            className="text-[var(--color-brand-light)]"
            aria-hidden
          />
          {nav.explore}
        </a>
        <a
          href="#get-started"
          onClick={handleSectionNav('get-started')}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--color-brand-dim)] px-3 py-1.5 text-xs font-semibold text-[var(--color-brand-light)]"
        >
          <Link2 size={14} strokeWidth={2} aria-hidden />
          {nav.start}
        </a>
      </nav>
    </header>
  );
};
