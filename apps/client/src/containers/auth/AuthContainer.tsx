import { useEffect, useRef, useState, type ReactElement } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/core/store/auth.store';
import { getPostAuthPath, persistReturnTo } from '@/core/navigation/sessionNav';
import { useI18n } from '@/core/i18n';
import type { Translations } from '@/core/i18n/i18n.types';
import { useLogin, useRegister, useGuestAuth, useMigrateGuest } from './api';
import { useGuestStatsStore } from '@/core/store/guestStats.store';
import type {
  AuthMode,
  LoginFormValues,
  RegisterFormValues,
} from './auth.types';
import { AuthComponent } from './AuthComponent';

/**
 * Maps raw API/network errors to user-friendly messages.
 */
function mapAuthError(
  error: unknown,
  errors: Translations['auth']['errors'],
): string {
  if (!error) return errors.unknown;

  const message = error instanceof Error ? error.message : errors.unknown;

  if (message.includes('401') || message.includes('Invalid credentials')) {
    return errors.invalidCredentials;
  }
  if (
    message.includes('409') ||
    message.includes('already taken') ||
    message.includes('already exists')
  ) {
    return errors.conflict;
  }
  if (message.includes('422') || message.includes('Unprocessable')) {
    return errors.validation;
  }
  if (message.includes('429') || message.includes('Too Many')) {
    return errors.rateLimit;
  }
  if (
    message.includes('Network') ||
    message.includes('ECONNREFUSED') ||
    message.includes('ERR_NETWORK')
  ) {
    return errors.network;
  }
  if (message.includes('500') || message.includes('Internal Server')) {
    return errors.server;
  }

  return errors.generic;
}

export const AuthContainer = (): ReactElement => {
  const { t } = useI18n();
  const { mode } = useParams<{ mode: string }>();
  const location = useLocation();
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
  const { mutate: migrateGuest } = useMigrateGuest();
  const guestAuthStarted = useRef(false);

  const authRedirectState =
    (location.state as { returnTo?: string } | null) ?? null;

  const finishAuth = (
    _accessToken: string,
    previousGuestDeviceId: string | null,
  ): void => {
    const returnTo = authRedirectState?.returnTo;
    if (returnTo) {
      persistReturnTo(returnTo);
    }
    const navigateAfterAuth = (): void => {
      void navigate(getPostAuthPath({ returnTo }), { replace: true });
    };

    if (!previousGuestDeviceId) {
      navigateAfterAuth();
      return;
    }

    const payload = useGuestStatsStore
      .getState()
      .buildMigratePayload(previousGuestDeviceId);
    if (payload.guestGames.length === 0) {
      navigateAfterAuth();
      return;
    }

    migrateGuest(payload, {
      onSettled: () => {
        useGuestStatsStore.getState().reset();
        navigateAfterAuth();
      },
    });
  };

  // Obtener token de guest al montar si no hay uno ya guardado
  useEffect(() => {
    if (guestDeviceId || guestAuthStarted.current) return;
    guestAuthStarted.current = true;

    guestAuth(
      { guestDeviceId: undefined },
      {
        onSuccess: ({ deviceId, accessToken }) => {
          const { userType } = useAuthStore.getState();
          // No sobrescribir sesión de usuario registrado si el guest llega tarde
          if (userType && userType !== 'guest') return;

          setGuestDeviceId(deviceId);
          setAccessToken(accessToken);
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = (values: LoginFormValues): void => {
    setServerError(null);
    login(
      { ...values, guestDeviceId: guestDeviceId ?? undefined },
      {
        onSuccess: ({ accessToken }) => {
          const previousGuestDeviceId = guestDeviceId;
          setAccessToken(accessToken);
          clearGuestDeviceId();
          finishAuth(accessToken, previousGuestDeviceId);
        },
        onError: (error) => {
          setServerError(mapAuthError(error, t.auth.errors));
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
          const previousGuestDeviceId = guestDeviceId;
          setAccessToken(accessToken);
          clearGuestDeviceId();
          finishAuth(accessToken, previousGuestDeviceId);
        },
        onError: (error) => {
          setServerError(mapAuthError(error, t.auth.errors));
        },
      },
    );
  };

  const handleModeChange = (newMode: AuthMode): void => {
    setServerError(null);
    void navigate(`/auth/${newMode}`, {
      replace: true,
      state: authRedirectState?.returnTo
        ? { returnTo: authRedirectState.returnTo }
        : undefined,
    });
  };

  const handleGoogleLogin = (): void => {
    setIsGoogleLoading(true);
    if (authRedirectState?.returnTo) {
      persistReturnTo(authRedirectState.returnTo);
    }
    // OAuth Google es un redirect de servidor — salimos de la SPA
    window.location.href = '/api/auth/google';
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
