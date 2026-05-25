import { useEffect, type ReactElement } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/core/store/auth.store';
import { useLogin, useRegister, useGuestAuth } from './api';
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
  const setGuestDeviceId = useAuthStore((s) => s.setGuestDeviceId);
  const guestDeviceId = useAuthStore((s) => s.guestDeviceId);

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
  const { mutate: guestAuth } = useGuestAuth();

  // Obtener token de guest al montar si no hay uno ya guardado
  useEffect(() => {
    if (!guestDeviceId) {
      guestAuth(
        { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        {
          onSuccess: ({ deviceId, accessToken }) => {
            setGuestDeviceId(deviceId);
            setAccessToken(accessToken);
          },
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = (values: LoginFormValues): void => {
    login(
      { ...values, guestDeviceId: guestDeviceId ?? undefined },
      {
        onSuccess: ({ accessToken }) => {
          setAccessToken(accessToken);
          void navigate('/backoffice/flashcards', { replace: true });
        },
      },
    );
  };

  const handleRegister = (values: RegisterFormValues): void => {
    register(
      { ...values, guestDeviceId: guestDeviceId ?? undefined },
      {
        onSuccess: ({ accessToken }) => {
          setAccessToken(accessToken);
          void navigate('/backoffice/flashcards', { replace: true });
        },
      },
    );
  };

  const handleModeChange = (newMode: AuthMode): void => {
    void navigate(`/auth/${newMode}`, { replace: true });
  };

  const handleGoogleLogin = (): void => {
    // OAuth Google es un redirect de servidor — salimos de la SPA
    window.location.href = '/api/v1/auth/google';
  };

  return (
    <AuthComponent
      mode={authMode}
      isLoading={isLoginPending || isRegisterPending}
      error={loginError?.message ?? registerError?.message ?? null}
      onLogin={handleLogin}
      onRegister={handleRegister}
      onModeChange={handleModeChange}
      onGoogleLogin={handleGoogleLogin}
    />
  );
};
