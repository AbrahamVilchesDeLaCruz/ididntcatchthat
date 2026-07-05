import { type ReactElement } from 'react';
import { LocaleToggle } from '@/common/components/LocaleToggle';
import { useI18n } from '@/core/i18n';
import { useAuthForm } from './hooks';
import { AuthLoginForm } from './components/AuthLoginForm';
import { AuthRegisterForm } from './components/AuthRegisterForm';
import { BrandWordmark } from '@/common/components/BrandWordmark';
import type {
  AuthMode,
  LoginFormValues,
  RegisterFormValues,
} from './auth.types';

interface AuthComponentProps {
  mode: AuthMode;
  isLoading: boolean;
  isGoogleLoading: boolean;
  error: string | null;
  onLogin: (values: LoginFormValues) => void;
  onRegister: (values: RegisterFormValues) => void;
  onModeChange: (mode: AuthMode) => void;
  onGoogleLogin: () => void;
  onClearError: () => void;
}

export const AuthComponent = ({
  mode,
  isLoading,
  isGoogleLoading,
  error,
  onLogin,
  onRegister,
  onModeChange,
  onGoogleLogin,
  onClearError,
}: AuthComponentProps): ReactElement => {
  const { t } = useI18n();
  const [formState, formHandlers] = useAuthForm(mode, onClearError);

  const handleLoginSubmit = (): void => {
    if (!formHandlers.validateLogin()) return;
    onLogin(formState.loginValues);
  };

  const handleRegisterSubmit = (): void => {
    if (!formHandlers.validateRegister()) return;
    onRegister(formState.registerValues);
  };

  return (
    <div className="min-h-svh bg-[var(--color-bg-base)] flex items-center justify-center px-4 relative">
      <div className="absolute top-4 right-4">
        <LocaleToggle variant="icon" />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="mb-2">
            <BrandWordmark className="text-3xl" />
          </h1>
          <p className="text-[var(--color-text-secondary)] text-sm">
            {mode === 'login'
              ? t.auth.login.subtitle
              : t.auth.register.subtitle}
          </p>
        </div>

        <div className="bg-[var(--color-bg-surface)] rounded-2xl p-8 shadow-xl border border-[var(--color-border)]">
          <div className="flex rounded-lg bg-[var(--color-bg-elevated)] p-1 mb-6">
            <button
              type="button"
              onClick={() => onModeChange('login')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === 'login'
                  ? 'bg-[var(--color-brand)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {t.auth.login.tab}
            </button>
            <button
              type="button"
              onClick={() => onModeChange('register')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === 'register'
                  ? 'bg-[var(--color-brand)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {t.auth.register.tab}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[var(--color-accent-green-dim)] border border-[var(--color-accent-red)]/20 text-[var(--color-accent-red)] text-sm flex items-start gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 mt-0.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>
              {error}
            </div>
          )}

          {mode === 'login' ? (
            <AuthLoginForm
              values={formState.loginValues}
              fieldErrors={formState.loginFieldErrors}
              isLoading={isLoading}
              onFieldChange={formHandlers.setLoginField}
              onSubmit={handleLoginSubmit}
            />
          ) : (
            <AuthRegisterForm
              values={formState.registerValues}
              fieldErrors={formState.registerFieldErrors}
              isLoading={isLoading}
              onFieldChange={formHandlers.setRegisterField}
              onSubmit={handleRegisterSubmit}
            />
          )}

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[var(--color-border)]" />
            <span className="text-xs text-[var(--color-text-muted)]">
              {t.auth.oauth.divider}
            </span>
            <div className="flex-1 h-px bg-[var(--color-border)]" />
          </div>

          <button
            type="button"
            onClick={onGoogleLogin}
            disabled={isLoading || isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-card)] text-[var(--color-text-primary)] text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-[var(--color-border-strong)] border-t-[var(--color-text-secondary)] animate-spin" />
                {t.auth.oauth.redirecting}
              </>
            ) : (
              <>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {t.auth.oauth.google}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
