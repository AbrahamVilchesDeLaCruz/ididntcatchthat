import { useEffect, type ReactElement } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/core/store/auth.store';

/**
 * Landing page after Google OAuth redirect.
 * The API redirects here with ?token=<accessToken> after a successful OAuth flow.
 */
export const AuthCallbackContainer = (): ReactElement => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      setAccessToken(token);
      void navigate('/backoffice/flashcards', { replace: true });
    } else {
      // No token — algo falló en el OAuth, volver al login
      void navigate('/auth/login', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-svh bg-[var(--color-bg-base)] flex items-center justify-center">
      <p className="text-gray-400 text-sm animate-pulse">
        Iniciando sesión con Google…
      </p>
    </div>
  );
};
