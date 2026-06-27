import { type ReactElement } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAuthStore } from '@/core/store/auth.store';
import { getAuthenticatedHomePathFromRoles } from '@/core/auth/postLoginRedirect';
import '@/containers/game/game-ui.css';

export const GameShell = (): ReactElement => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const roles = useAuthStore((s) => s.roles);

  const handleBack = (): void => {
    if (window.history.length > 1) {
      void (navigate(-1) as unknown as Promise<void>);
    } else {
      void navigate('/game');
    }
  };

  const appLink = isAuthenticated
    ? {
        to: getAuthenticatedHomePathFromRoles(roles),
        label:
          roles.includes('admin') || roles.includes('teacher')
            ? 'Dashboard'
            : 'Mis estadísticas',
      }
    : null;

  return (
    <div className="flex min-h-svh flex-col bg-[var(--color-bg-base)]">
      <header className="game-shell-accent sticky top-0 z-40 shrink-0 border-b bg-[var(--color-bg-base)]/90 backdrop-blur-sm">
        <nav
          className="mx-auto grid h-12 max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-4 text-sm"
          aria-label="Game navigation"
        >
          <div className="flex justify-start">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-0.5 rounded-lg px-2 py-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--color-text-primary)]"
            >
              <ChevronLeft size={16} strokeWidth={2} aria-hidden />
              <span className="hidden sm:inline">Volver</span>
            </button>
          </div>

          <Link
            to="/"
            className="game-shell-logo truncate text-center font-semibold transition-opacity hover:opacity-90"
          >
            ididntcatchthat
          </Link>

          <div className="flex justify-end">
            {appLink ? (
              <Link
                to={appLink.to}
                className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-text-primary)]"
              >
                {appLink.label}
              </Link>
            ) : (
              <Link
                to="/auth/login"
                className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-text-primary)]"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </nav>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  );
};
