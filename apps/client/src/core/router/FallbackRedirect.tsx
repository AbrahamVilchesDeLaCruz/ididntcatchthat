import { type ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { DEFAULT_AUTHENTICATED_HOME } from '@/core/auth/postLoginRedirect';
import { useAuthStore } from '@/core/store/auth.store';

export const FallbackRedirect = (): ReactElement => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <Navigate to={isAuthenticated ? DEFAULT_AUTHENTICATED_HOME : '/'} replace />
  );
};
