import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  guestDeviceId: string | null;
}

interface AuthActions {
  setAccessToken: (token: string) => void;
  setGuestDeviceId: (deviceId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      accessToken: null,
      isAuthenticated: false,
      guestDeviceId: null,

      setAccessToken: (token) =>
        set({ accessToken: token, isAuthenticated: true }),

      setGuestDeviceId: (deviceId) => set({ guestDeviceId: deviceId }),

      logout: () => set({ accessToken: null, isAuthenticated: false }),
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
