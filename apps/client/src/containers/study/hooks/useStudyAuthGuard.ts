import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/core/store/auth.store';
import { useCurrentUser } from '@/core/auth/useCurrentUser';

/**
 * Protege rutas /study: solo usuarios registrados (no guest).
 * Espera a que el bootstrap resuelva userType tras refresh del JWT
 * antes de redirigir a login.
 */
export function useStudyAuthGuard(): {
  isReady: boolean;
  canStudy: boolean;
} {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userType = useAuthStore((s) => s.userType);
  const { canStudy } = useCurrentUser();

  const isAuthPending = isAuthenticated && userType === null;
  const isReady = !isAuthPending;

  useEffect(() => {
    if (!isReady) return;
    if (!canStudy) {
      void navigate('/auth/login', {
        state: { returnTo: '/study' },
        replace: true,
      });
    }
  }, [canStudy, isReady, navigate]);

  return { isReady, canStudy };
}
