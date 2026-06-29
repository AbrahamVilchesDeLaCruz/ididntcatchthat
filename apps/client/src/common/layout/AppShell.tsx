import { type ReactElement } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/core/store/auth.store';
import { useCurrentUser } from '@/core/auth/useCurrentUser';
import { useSessionRouteTracking } from '@/core/navigation/useSessionRouteTracking';
import { AppSidebar } from '@/common/layout/AppSidebar';

/**
 * Layout route for authenticated app pages (stats, backoffice).
 * Renders the persistent sidebar + the matched child route via <Outlet />.
 * Redirects to login if not authenticated.
 */
export const AppShell = (): ReactElement => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();
  const { canManageFlashcards, canAccessBackoffice } = useCurrentUser();
  useSessionRouteTracking();

  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;

  if (
    location.pathname.startsWith('/backoffice/flashcards') &&
    !canManageFlashcards
  ) {
    return <Navigate to="/home" replace />;
  }

  if (location.pathname.startsWith('/backoffice') && !canAccessBackoffice) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="flex h-svh overflow-hidden bg-[var(--color-bg-base)]">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto p-4 pt-16 md:p-8 md:pt-8">
        <Outlet />
      </main>
    </div>
  );
};
