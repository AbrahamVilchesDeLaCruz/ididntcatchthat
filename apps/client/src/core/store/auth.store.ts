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
        // roles/userType NO se persisten — vienen del JWT vivo o del refresh;
        // persistirlos dejaba permisos admin stale tras cambiar de cuenta.
      }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<AuthState> | undefined;
        return {
          ...current,
          isAuthenticated: saved?.isAuthenticated ?? false,
          guestDeviceId: saved?.guestDeviceId ?? null,
          // Ignorar roles/userType/userId legacy en localStorage
        };
      },
    },
  ),
);
