import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  decodeAccessTokenPayload,
  resolveUserType,
} from '@/core/auth/resolveUserRole';

export type UserType = 'guest' | 'user' | 'teacher' | 'admin';

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  /**
   * `true` entre que el usuario pulsa logout y el siguiente render del
   * guard (p.ej. AppShell). Permite distinguir "acabo de salir" de "nunca
   * autenticado" para redirigir a / (landing) en lugar de /auth/login.
   * NO se persiste — es un flag de intención in-flight, se reinicia en cada
   * carga.
   */
  isLogoutPending: boolean;
  guestDeviceId: string | null;
  userType: UserType | null;
  userId: string | null;
  roles: string[];
}

interface AuthActions {
  setAccessToken: (token: string) => void;
  setGuestDeviceId: (deviceId: string) => void;
  clearGuestDeviceId: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      accessToken: null,
      isAuthenticated: false,
      isLogoutPending: false,
      guestDeviceId: null,
      userType: null,
      userId: null,
      roles: [],

      setAccessToken: (token) => {
        const payload = decodeAccessTokenPayload(token);
        const roles = payload.roles ?? [];
        set({
          accessToken: token,
          isAuthenticated: true,
          isLogoutPending: false,
          userType: resolveUserType(payload.type, roles),
          userId: payload.userId ?? null,
          roles,
        });
      },

      setGuestDeviceId: (deviceId) => set({ guestDeviceId: deviceId }),

      clearGuestDeviceId: () => set({ guestDeviceId: null }),

      logout: () =>
        set({
          accessToken: null,
          isAuthenticated: false,
          isLogoutPending: true,
          userType: null,
          userId: null,
          roles: [],
        }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // No persistir el token en localStorage — solo el estado de sesión
        // El accessToken es efímero, se renueva via refreshToken cookie
        isAuthenticated: state.isAuthenticated,
        // guestDeviceId sí se persiste para identificar al guest entre recargas
        guestDeviceId: state.guestDeviceId,
        // isLogoutPending NO se persiste — es un flag de intención in-flight.
        // roles/userType/isLogoutPending NO se persisten — vienen del JWT vivo
        // o del refresh; persistirlos dejaba permisos admin stale o redirects
        // fantasma tras cambiar de cuenta.
      }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<AuthState> | undefined;
        return {
          ...current,
          isAuthenticated: saved?.isAuthenticated ?? false,
          guestDeviceId: saved?.guestDeviceId ?? null,
          // isLogoutPending siempre arranca en false (no persistido)
          isLogoutPending: false,
          // Ignorar roles/userType/userId legacy en localStorage
        };
      },
    },
  ),
);
