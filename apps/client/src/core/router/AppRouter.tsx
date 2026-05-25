import { type ReactElement } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '@/core/store/auth.store';
import { useAuthBootstrap } from '@/core/auth/useAuthBootstrap';
import { LandingView } from '@/views/LandingView';
import { AuthView } from '@/views/AuthView';
import { AuthCallbackView } from '@/views/AuthCallbackView';
import { BackofficeView } from '@/views/BackofficeView';

const ProtectedRoute = ({
  children,
}: {
  children: ReactElement;
}): ReactElement => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  return children;
};

const AppRoutes = (): ReactElement => {
  const ready = useAuthBootstrap();

  if (!ready) {
    return (
      <div className="min-h-svh bg-[var(--color-bg-base)] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingView />} />
      <Route path="/auth/callback" element={<AuthCallbackView />} />
      <Route path="/auth/:mode" element={<AuthView />} />
      <Route
        path="/backoffice/*"
        element={
          <ProtectedRoute>
            <BackofficeView />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const AppRouter = (): ReactElement => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};
