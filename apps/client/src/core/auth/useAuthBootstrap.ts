import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { resolveApiBaseUrl } from '@/core/api/resolveApiBaseUrl';
import { useAuthStore } from '@/core/store/auth.store';
import { redirectToLanding } from './redirectToLanding';

/**
 * Intenta renovar el accessToken silenciosamente al montar la app.
 *
 * - Usuario registrado: si `isAuthenticated = true` pero no hay `accessToken`
 *   (recarga de página), hace un refresh con la cookie httpOnly. Si falla, logout.
 *
 * - Guest: si hay `guestDeviceId` persistido pero no hay `accessToken`, solicita
 *   un nuevo token guest reutilizando el device id.
 *
 * Devuelve `ready = true` una vez que el bootstrap terminó.
 */
export const useAuthBootstrap = (): boolean => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const guestDeviceId = useAuthStore((s) => s.guestDeviceId);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setGuestDeviceId = useAuthStore((s) => s.setGuestDeviceId);
  const logout = useAuthStore((s) => s.logout);

  const needsGuestRefresh = guestDeviceId !== null && !accessToken;
  const needsRegisteredRefresh =
    isAuthenticated && !accessToken && guestDeviceId === null;
  const needsBootstrap = needsGuestRefresh || needsRegisteredRefresh;

  const [ready, setReady] = useState(!needsBootstrap);

  const attempted = useRef(false);

  useEffect(() => {
    if (!needsBootstrap || attempted.current) return;
    attempted.current = true;

    const apiBase = resolveApiBaseUrl();

    if (needsGuestRefresh) {
      axios
        .post<{ accessToken: string; deviceId: string }>(
          `${apiBase}/auth/guest`,
          { guestDeviceId: guestDeviceId ?? undefined },
        )
        .then((res) => {
          setAccessToken(res.data.accessToken);
          setGuestDeviceId(res.data.deviceId);
        })
        .catch(() => {
          logout();
          redirectToLanding();
        })
        .finally(() => {
          setReady(true);
        });
      return;
    }

    axios
      .post<{ accessToken: string }>(
        `${apiBase}/auth/refresh`,
        {},
        { withCredentials: true },
      )
      .then((res) => {
        setAccessToken(res.data.accessToken);
      })
      .catch(() => {
        logout();
        redirectToLanding();
      })
      .finally(() => {
        setReady(true);
      });
  }, [
    needsBootstrap,
    needsGuestRefresh,
    guestDeviceId,
    setAccessToken,
    setGuestDeviceId,
    logout,
  ]);

  return ready;
};
