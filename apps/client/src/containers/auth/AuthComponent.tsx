import { type ReactElement } from 'react';
import { useAuthForm } from './hooks';
import { AuthLoginForm } from './components/AuthLoginForm';
import { AuthRegisterForm } from './components/AuthRegisterForm';
import type {
  AuthMode,
  LoginFormValues,
  RegisterFormValues,
} from './auth.types';

interface AuthComponentProps {
  mode: AuthMode;
  isLoading: boolean;
  error: string | null;
  onLogin: (values: LoginFormValues) => void;
  onRegister: (values: RegisterFormValues) => void;
  onModeChange: (mode: AuthMode) => void;
  onGoogleLogin: () => void;
}

export const AuthComponent = ({
  mode,
  isLoading,
  error,
  onLogin,
  onRegister,
  onModeChange,
  onGoogleLogin,
}: AuthComponentProps): ReactElement => {
  const [formState, formHandlers] = useAuthForm(mode);

  return (
    <div className="min-h-svh bg-[var(--color-bg-base)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            ididntcatchthat
          </h1>
          <p className="text-gray-400 text-sm">
            {mode === 'login'
              ? 'Accedé a tu cuenta'
              : 'Creá tu cuenta y empezá a aprender'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-[var(--color-bg-surface,#1a1a2e)] rounded-2xl p-8 shadow-xl border border-white/10">
          {/* Mode tabs */}
          <div className="flex rounded-lg bg-white/5 p-1 mb-6">
            <button
              type="button"
              onClick={() => onModeChange('login')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === 'login'
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => onModeChange('register')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === 'register'
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          {mode === 'login' ? (
            <AuthLoginForm
              values={formState.loginValues}
              isLoading={isLoading}
              onFieldChange={formHandlers.setLoginField}
              onSubmit={() => onLogin(formState.loginValues)}
            />
          ) : (
            <AuthRegisterForm
              values={formState.registerValues}
              isLoading={isLoading}
              onFieldChange={formHandlers.setRegisterField}
              onSubmit={() => onRegister(formState.registerValues)}
            />
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-500">o continuá con</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={onGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
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
            Continuar con Google
          </button>
        </div>
      </div>
    </div>
  );
};
