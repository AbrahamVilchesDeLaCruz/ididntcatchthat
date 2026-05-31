import { type ReactElement } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/core/store/auth.store';
import { AppSidebar } from '@/common/layout/AppSidebar';

/**
 * Layout route for authenticated app pages (stats, backoffice).
 * Renders the persistent sidebar + the matched child route via <Outlet />.
 * Redirects to login if not authenticated.
 */
export const AppShell = (): ReactElement => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;

  return (
    <div className="flex min-h-svh bg-[var(--color-bg-base)]">
      <AppSidebar />
      <main className="flex-1 overflow-auto p-4 pt-16 md:p-8 md:pt-8">
        <Outlet />
      </main>
    </div>
  );
};
