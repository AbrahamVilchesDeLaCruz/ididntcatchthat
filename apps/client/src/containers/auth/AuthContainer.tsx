import { type ReactElement } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/core/store/auth.store';
import { useLogin, useRegister } from './api';
import type {
  AuthMode,
  LoginFormValues,
  RegisterFormValues,
} from './auth.types';
import { AuthComponent } from './AuthComponent';

export const AuthContainer = (): ReactElement => {
  const { mode } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  const authMode: AuthMode = mode === 'register' ? 'register' : 'login';

  const {
    mutate: login,
    isPending: isLoginPending,
    error: loginError,
  } = useLogin();
  const {
    mutate: register,
    isPending: isRegisterPending,
    error: registerError,
  } = useRegister();

  const handleLogin = (values: LoginFormValues): void => {
    login(values, {
      onSuccess: ({ accessToken }) => {
        setAccessToken(accessToken);
        void navigate('/backoffice/flashcards', { replace: true });
      },
    });
  };

  const handleRegister = (values: RegisterFormValues): void => {
    register(values, {
      onSuccess: ({ accessToken }) => {
        setAccessToken(accessToken);
        void navigate('/backoffice/flashcards', { replace: true });
      },
    });
  };

  const handleModeChange = (newMode: AuthMode): void => {
    void navigate(`/auth/${newMode}`, { replace: true });
  };

  return (
    <AuthComponent
      mode={authMode}
      isLoading={isLoginPending || isRegisterPending}
      error={loginError?.message ?? registerError?.message ?? null}
      onLogin={handleLogin}
      onRegister={handleRegister}
      onModeChange={handleModeChange}
    />
  );
};
