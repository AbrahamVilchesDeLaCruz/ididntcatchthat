import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/core/store/auth.store';

/**
 * Intenta renovar el accessToken silenciosamente al montar la app.
 *
 * Si `isAuthenticated = true` pero no hay `accessToken` (recarga de página),
 * hace un refresh con la cookie httpOnly. Si falla, hace logout.
 *
 * Devuelve `ready = true` una vez que el bootstrap terminó (con éxito o no),
 * para que el router no renderice las rutas hasta saber el estado real.
 */
export const useAuthBootstrap = (): boolean => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const logout = useAuthStore((s) => s.logout);

  // Si no hace falta refresh, arrancamos ready directamente
  const needsRefresh = isAuthenticated && !accessToken;
  const [ready, setReady] = useState(!needsRefresh);

  // Ref para evitar doble-llamada en Strict Mode
  const attempted = useRef(false);

  useEffect(() => {
    if (!needsRefresh || attempted.current) return;
    attempted.current = true;

    axios
      .post<{ accessToken: string }>(
        `${import.meta.env.VITE_API_URL ?? '/api/v1'}/auth/refresh`,
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
