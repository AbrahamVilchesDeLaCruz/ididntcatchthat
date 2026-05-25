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
}

export const AuthComponent = ({
  mode,
  isLoading,
  error,
  onLogin,
  onRegister,
  onModeChange,
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
        </div>
      </div>
    </div>
  );
};
