import { useEffect, useMemo, type ReactElement } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/core/store/auth.store';
import { getPostAuthPath } from '@/core/navigation/sessionNav';

/**
 * Landing page after Google OAuth redirect.
 * The API redirects here with ?token=<accessToken> on success,
 * or ?error=<reason> on failure.
 */
export const AuthCallbackContainer = (): ReactElement => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  const token = searchParams.get('token');
  const errorParam = searchParams.get('error');

  // Derive error message from URL params — no state needed
  const errorMessage = useMemo((): string | null => {
    if (token) return null;
    if (errorParam === 'access_denied')
      return 'Cancelaste el acceso con Google.';
    if (errorParam)
      return 'El inicio de sesión con Google falló. Inténtalo de nuevo.';
    return 'No pudimos iniciar sesión con Google.';
  }, [token, errorParam]);

  useEffect(() => {
    if (token) {
      setAccessToken(token);
      void navigate(getPostAuthPath(), { replace: true });
      return;
    }

    // Show error briefly then redirect to login
    const timer = setTimeout(() => {
      void navigate('/auth/login', { replace: true });
    }, 2500);

    return () => clearTimeout(timer);
  }, [token, errorMessage, setAccessToken, navigate]);

  if (errorMessage) {
    return (
      <div className="min-h-svh bg-[var(--color-bg-base)] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <p className="text-[var(--color-text-primary)] font-medium mb-1">
            {errorMessage}
          </p>
          <p className="text-[var(--color-text-muted)] text-sm">
            Redirigiendo al login…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-[var(--color-bg-base)] flex items-center justify-center">
      <div className="text-center">
        <div className="w-6 h-6 rounded-full border-2 border-[var(--color-border-strong)] border-t-[var(--color-text-secondary)] animate-spin mx-auto mb-3" />
        <p className="text-[var(--color-text-secondary)] text-sm">
          Iniciando sesión con Google…
        </p>
      </div>
    </div>
  );
};
