import { type ReactElement } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { BrandWordmark } from '@/common/components/BrandWordmark';
import { SkipToContentLink } from '@/common/components/SkipToContentLink';
import { useI18n } from '@/core/i18n';
import { useAuthStore } from '@/core/store/auth.store';
import { useCurrentUser } from '@/core/auth/useCurrentUser';
import { DEFAULT_AUTHENTICATED_HOME } from '@/core/auth/postLoginRedirect';
import { useSessionRouteTracking } from '@/core/navigation/useSessionRouteTracking';
import '@/containers/game/game-ui.css';

const ACTIVE_PLAY_ROUTE = /^\/(game|study)\/[^/]+$/;

export const GameShell = (): ReactElement => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { canStudy } = useCurrentUser();
  useSessionRouteTracking();

  const isStudyRoute = location.pathname.startsWith('/study');
  const isGameRoute = location.pathname.startsWith('/game');
  const isActivePlayRoute = ACTIVE_PLAY_ROUTE.test(location.pathname);

  const handleBack = (): void => {
    if (isStudyRoute) {
      void navigate(isAuthenticated ? DEFAULT_AUTHENTICATED_HOME : '/');
      return;
    }
    if (isGameRoute && isAuthenticated) {
      void navigate(DEFAULT_AUTHENTICATED_HOME);
      return;
    }
    if (window.history.length > 1) {
      void (navigate(-1) as unknown as Promise<void>);
    } else {
      void navigate('/game');
    }
  };

  const homeLink = isAuthenticated ? DEFAULT_AUTHENTICATED_HOME : '/';

  const appLink = isAuthenticated
    ? {
        to: DEFAULT_AUTHENTICATED_HOME,
        label: t.home.navApp,
      }
    : null;

  const actionLinkClass =
    'shrink-0 rounded-full border border-[var(--color-border)] px-2 py-1 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-text-primary)] sm:px-3';

  const backButtonClass =
    'inline-flex items-center gap-0.5 rounded-lg px-2 py-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--color-text-primary)]';

  return (
    <div className="flex min-h-svh flex-col bg-[var(--color-bg-base)]">
      <SkipToContentLink targetId="main-content" />
      {isActivePlayRoute ? (
        <button
          type="button"
          data-testid="mobile-floating-back"
          onClick={handleBack}
          aria-label={t.gameShell.back}
          className="safe-top fixed left-3 top-3 z-50 inline-flex size-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-base)]/95 text-[var(--color-text-muted)] shadow-sm backdrop-blur-sm transition-colors hover:text-[var(--color-text-primary)] md:hidden"
        >
          <ChevronLeft size={18} strokeWidth={2} aria-hidden />
        </button>
      ) : null}

      <header
        className={[
          'game-shell-accent safe-top sticky top-0 z-40 shrink-0 border-b bg-[var(--color-bg-base)]/90 backdrop-blur-sm',
          isActivePlayRoute ? 'max-md:h-10' : '',
        ].join(' ')}
      >
        <nav
          className={[
            'mx-auto grid min-w-0 max-w-6xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1 px-2 text-sm sm:gap-2 sm:px-4',
            isActivePlayRoute ? 'h-10 md:h-12' : 'h-12',
          ].join(' ')}
          aria-label="Game navigation"
        >
          <div className="flex min-w-0 justify-start">
            <button
              type="button"
              onClick={handleBack}
              aria-label={t.gameShell.back}
              className={[
                backButtonClass,
                isActivePlayRoute ? 'hidden md:inline-flex' : 'inline-flex',
              ].join(' ')}
            >
              <ChevronLeft size={16} strokeWidth={2} aria-hidden />
              <span className="hidden sm:inline">{t.gameShell.back}</span>
            </button>
          </div>

          <Link
            to={homeLink}
            className="min-w-0 truncate text-center transition-opacity hover:opacity-90"
          >
            <BrandWordmark
              className={
                isActivePlayRoute
                  ? 'text-xs sm:text-sm md:text-base'
                  : 'text-sm sm:text-base'
              }
            />
          </Link>

          <div className="flex min-w-0 max-w-full justify-end gap-1 overflow-x-auto sm:gap-2 [&::-webkit-scrollbar]:hidden">
            {canStudy && isGameRoute ? (
              <Link to="/study" className={actionLinkClass}>
                {t.landing.hero.ctaStudy}
              </Link>
            ) : null}
            {isStudyRoute ? (
              <Link to="/game" className={actionLinkClass}>
                {t.landing.hero.ctaPlay}
              </Link>
            ) : null}
            {appLink ? (
              <Link to={appLink.to} className={actionLinkClass}>
                {appLink.label}
              </Link>
            ) : (
              <Link to="/auth/login" className={actionLinkClass}>
                {t.gameShell.login}
              </Link>
            )}
          </div>
        </nav>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <Outlet />
      </main>
    </div>
  );
};
