import { type ReactElement } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/core/store/auth.store';
import { useCurrentUser } from '@/core/auth/useCurrentUser';
import { useSessionRouteTracking } from '@/core/navigation/useSessionRouteTracking';
import { AppSidebar } from '@/common/layout/AppSidebar';
import { SkipToContentLink } from '@/common/components/SkipToContentLink';
import { ToastHost } from '@/core/notifications/ToastHost';

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
      <SkipToContentLink targetId="main-content" />
      <AppSidebar />
      <main
        id="main-content"
        tabIndex={-1}
        className="app-scroll flex-1 overflow-y-auto overflow-x-hidden p-4 pt-[max(4rem,calc(env(safe-area-inset-top,0px)+3rem))] pb-[max(1rem,env(safe-area-inset-bottom,0px))] md:p-8 md:pt-8"
      >
        <Outlet />
      </main>
      <ToastHost />
    </div>
  );
};
