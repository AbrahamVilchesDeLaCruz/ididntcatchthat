import { type ReactElement } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAuthStore } from '@/core/store/auth.store';
import { useCurrentUser } from '@/core/auth/useCurrentUser';

/**
 * Layout route for game pages (/game, /game/:id, /game/:id/summary).
 * Focused experience — no sidebar, just a slim topbar with:
 *   - Back/exit button (context-aware)
 *   - Logo
 *   - User nav link (stats or backoffice) if authenticated
 */
export const GameShell = (): ReactElement => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { canAccessBackoffice } = useCurrentUser();

  const handleBack = (): void => {
    if (window.history.length > 1) {
      // navigate(-1) returns void — cast to avoid no-floating-promises
      void (navigate(-1) as unknown as Promise<void>);
    } else {
      void navigate('/game');
    }
  };

  const appLink = isAuthenticated
    ? canAccessBackoffice
      ? { to: '/backoffice/flashcards', label: 'Dashboard' }
      : { to: '/stats', label: 'Mis estadísticas' }
    : null;

  return (
    <div className="flex min-h-svh flex-col bg-[var(--color-bg-base)]">
      {/* Topbar */}
      <header className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-white/5 bg-[var(--color-bg-base)]/90 px-4 backdrop-blur-sm shrink-0">
        {/* Left — back */}
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
          aria-label="Volver"
        >
          <ChevronLeft size={16} strokeWidth={2} />
          <span className="hidden sm:inline">Volver</span>
        </button>

        {/* Center — logo */}
        <Link
          to="/"
          className="text-sm font-bold text-white/70 transition-colors hover:text-white"
        >
          ididntcatchthat
        </Link>

        {/* Right — app nav */}
        {appLink ? (
          <Link
            to={appLink.to}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-gray-400 transition-colors hover:border-white/20 hover:text-white"
          >
            {appLink.label}
          </Link>
        ) : (
          <Link
            to="/auth/login"
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-gray-400 transition-colors hover:border-white/20 hover:text-white"
          >
            Iniciar sesión
          </Link>
        )}
      </header>

      {/* Page content */}
      <div className="flex flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  );
};
