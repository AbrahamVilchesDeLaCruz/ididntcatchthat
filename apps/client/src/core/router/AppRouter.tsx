import { type ReactElement } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '@/core/store/auth.store';
import { LandingView } from '@/views/LandingView';
import { AuthView } from '@/views/AuthView';
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

export const AppRouter = (): ReactElement => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingView />} />
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
    </BrowserRouter>
  );
};
