import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { resolveApiBaseUrl } from '@/core/api/resolveApiBaseUrl';
import { useAuthStore } from '@/core/store/auth.store';

/**
 * Intenta renovar el accessToken silenciosamente al montar la app.
 *
 * - Usuario registrado: si `isAuthenticated = true` pero no hay `accessToken`
 *   (recarga de página), hace un refresh con la cookie httpOnly. Si falla, logout.
 *
 * - Guest: no tiene cookie de refresh. Al recargar se limpia `isAuthenticated`
 *   para que `GameConfigContainer` lo trate como no autenticado y pida un nuevo
 *   token guest. El `guestDeviceId` se conserva para reutilizarlo.
 *
 * Devuelve `ready = true` una vez que el bootstrap terminó.
 */
export const useAuthBootstrap = (): boolean => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const guestDeviceId = useAuthStore((s) => s.guestDeviceId);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const logout = useAuthStore((s) => s.logout);

  const isGuest = isAuthenticated && guestDeviceId !== null;
  // Guests don't have a refreshToken cookie — clear auth state so
  // GameConfigContainer re-authenticates them as guest
  const needsRefresh = isAuthenticated && !accessToken && !isGuest;

  // Si el guest recarga, limpiar isAuthenticated (mantener guestDeviceId)
  if (isGuest && !accessToken) {
    logout();
  }

  // Si no hace falta refresh, arrancamos ready directamente
  const [ready, setReady] = useState(!needsRefresh);

  // Ref para evitar doble-llamada en Strict Mode
  const attempted = useRef(false);

  useEffect(() => {
    if (!needsRefresh || attempted.current) return;
    attempted.current = true;

    axios
      .post<{ accessToken: string }>(
        `${resolveApiBaseUrl()}/auth/refresh`,
        {},
        { withCredentials: true },
      )
      .then((res) => {
        setAccessToken(res.data.accessToken);
      })
      .catch(() => {
        logout();
      })
      .finally(() => {
        setReady(true);
      });
  }, [needsRefresh, setAccessToken, logout]);

  return ready;
};
