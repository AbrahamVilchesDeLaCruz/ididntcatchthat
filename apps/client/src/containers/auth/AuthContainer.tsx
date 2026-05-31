import { useEffect, useState, type ReactElement } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/core/store/auth.store';
import { useLogin, useRegister, useGuestAuth } from './api';
import type {
  AuthMode,
  LoginFormValues,
  RegisterFormValues,
} from './auth.types';
import { AuthComponent } from './AuthComponent';

/**
 * Maps raw API/network errors to user-friendly Spanish messages.
 */
function mapAuthError(error: unknown): string {
  if (!error) return 'Error desconocido. Intentá de nuevo.';

  const message = error instanceof Error ? error.message : 'Error desconocido';

  // HTTP status codes embedded in axios error messages
  if (message.includes('401') || message.includes('Invalid credentials')) {
    return 'Email o contraseña incorrectos.';
  }
  if (
    message.includes('409') ||
    message.includes('already taken') ||
    message.includes('already exists')
  ) {
    return 'El email o nickname ya está en uso. Probá con otro.';
  }
  if (message.includes('422') || message.includes('Unprocessable')) {
    return 'Revisá que los datos ingresados sean correctos.';
  }
  if (message.includes('429') || message.includes('Too Many')) {
    return 'Demasiados intentos. Esperá un momento y volvé a intentarlo.';
  }
  if (
    message.includes('Network') ||
    message.includes('ECONNREFUSED') ||
    message.includes('ERR_NETWORK')
  ) {
    return 'Sin conexión al servidor. Revisá tu internet.';
  }
  if (message.includes('500') || message.includes('Internal Server')) {
    return 'Error interno del servidor. Intentá de nuevo en un momento.';
  }

  return 'Algo salió mal. Intentá de nuevo.';
}

export const AuthContainer = (): ReactElement => {
  const { mode } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setGuestDeviceId = useAuthStore((s) => s.setGuestDeviceId);
  const clearGuestDeviceId = useAuthStore((s) => s.clearGuestDeviceId);
  const guestDeviceId = useAuthStore((s) => s.guestDeviceId);

  const authMode: AuthMode = mode === 'register' ? 'register' : 'login';

  const [serverError, setServerError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { mutate: login, isPending: isLoginPending } = useLogin();
  const { mutate: register, isPending: isRegisterPending } = useRegister();
  const { mutate: guestAuth } = useGuestAuth();

  // Obtener token de guest al montar si no hay uno ya guardado
  useEffect(() => {
    if (!guestDeviceId) {
      guestAuth(
        { guestDeviceId: undefined },
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
    setServerError(null);
    login(
      { ...values, guestDeviceId: guestDeviceId ?? undefined },
      {
        onSuccess: ({ accessToken }) => {
          setAccessToken(accessToken);
          clearGuestDeviceId();
          void navigate('/backoffice/flashcards', { replace: true });
        },
        onError: (error) => {
          setServerError(mapAuthError(error));
        },
      },
    );
  };

  const handleRegister = (values: RegisterFormValues): void => {
    setServerError(null);
    register(
      { ...values, guestDeviceId: guestDeviceId ?? undefined },
      {
        onSuccess: ({ accessToken }) => {
          setAccessToken(accessToken);
          clearGuestDeviceId();
          void navigate('/backoffice/flashcards', { replace: true });
        },
        onError: (error) => {
          setServerError(mapAuthError(error));
        },
      },
    );
  };

  const handleModeChange = (newMode: AuthMode): void => {
    setServerError(null);
    void navigate(`/auth/${newMode}`, { replace: true });
  };

  const handleGoogleLogin = (): void => {
    setIsGoogleLoading(true);
    // OAuth Google es un redirect de servidor — salimos de la SPA
    window.location.href = '/api/v1/auth/google';
  };

  return (
    <AuthComponent
      mode={authMode}
      isLoading={isLoginPending || isRegisterPending}
      isGoogleLoading={isGoogleLoading}
      error={serverError}
      onLogin={handleLogin}
      onRegister={handleRegister}
      onModeChange={handleModeChange}
      onGoogleLogin={handleGoogleLogin}
      onClearError={() => setServerError(null)}
    />
  );
};
