import { useEffect, useMemo, type ReactElement } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/core/store/auth.store';
import { getPostAuthPath } from '@/core/navigation/sessionNav';
import { useI18n } from '@/core/i18n';

/**
 * Landing page after Google OAuth redirect.
 * The API redirects here with ?token=<accessToken> on success,
 * or ?error=<reason> on failure.
 */
export const AuthCallbackContainer = (): ReactElement => {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  const token = searchParams.get('token');
  const errorParam = searchParams.get('error');

  const errorMessage = useMemo((): string | null => {
    if (token) return null;
    if (errorParam === 'access_denied') return t.auth.callback.accessDenied;
    if (errorParam) return t.auth.callback.failed;
    return t.auth.callback.generic;
  }, [token, errorParam, t.auth.callback]);

  useEffect(() => {
    if (token) {
      setAccessToken(token);
      void navigate(getPostAuthPath(), { replace: true });
      return;
    }

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
            {t.auth.callback.redirectingToLogin}
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
          {t.auth.callback.loading}
        </p>
      </div>
    </div>
  );
};
