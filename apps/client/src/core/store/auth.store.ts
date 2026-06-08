import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserType = 'guest' | 'user' | 'teacher' | 'admin';

interface JwtPayload {
  type?: UserType;
  userId?: string;
  roles?: string[];
}

function decodeJwt(token: string): JwtPayload {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return {};
  }
}

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
        const { type, userId, roles } = decodeJwt(token);
        set({
          accessToken: token,
          isAuthenticated: true,
          userType: type ?? null,
          userId: userId ?? null,
          roles: roles ?? [],
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
      }),
    },
  ),
);
