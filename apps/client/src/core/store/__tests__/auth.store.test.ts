import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../auth.store';

// JWT helper — genera un token con el payload dado (sin firma real)
const makeJwt = (payload: Record<string, unknown>): string => {
  const encoded = btoa(JSON.stringify(payload));
  return `header.${encoded}.signature`;
};

const resetStore = (): void => {
  useAuthStore.setState({
    accessToken: null,
    isAuthenticated: false,
    guestDeviceId: null,
    userType: null,
    userId: null,
    roles: [],
  });
};

describe('auth.store', () => {
  beforeEach(resetStore);

  describe('setAccessToken', () => {
    it('decodes JWT and sets userType, userId and roles', () => {
      const token = makeJwt({
        type: 'teacher',
        userId: 'u-1',
        roles: ['teacher'],
      });

      useAuthStore.getState().setAccessToken(token);
      const state = useAuthStore.getState();

      expect(state.accessToken).toBe(token);
      expect(state.isAuthenticated).toBe(true);
      expect(state.userType).toBe('teacher');
      expect(state.userId).toBe('u-1');
      expect(state.roles).toEqual(['teacher']);
    });

    it('defaults roles to [] when JWT has no roles field', () => {
      const token = makeJwt({ type: 'user', userId: 'u-2' });

      useAuthStore.getState().setAccessToken(token);

      expect(useAuthStore.getState().roles).toEqual([]);
    });

    it('defaults userType to null when JWT has no type nor roles', () => {
      const token = makeJwt({ userId: 'u-3' });

      useAuthStore.getState().setAccessToken(token);

      expect(useAuthStore.getState().userType).toBeNull();
    });

    it('prioriza roles[] sobre type al decodificar JWT', () => {
      const token = makeJwt({
        type: 'admin',
        userId: 'u-5',
        roles: ['user'],
      });

      useAuthStore.getState().setAccessToken(token);

      expect(useAuthStore.getState().userType).toBe('user');
      expect(useAuthStore.getState().roles).toEqual(['user']);
    });
  });

  describe('setGuestDeviceId / clearGuestDeviceId', () => {
    it('sets and clears guestDeviceId', () => {
      useAuthStore.getState().setGuestDeviceId('device-abc');
      expect(useAuthStore.getState().guestDeviceId).toBe('device-abc');

      useAuthStore.getState().clearGuestDeviceId();
      expect(useAuthStore.getState().guestDeviceId).toBeNull();
    });
  });

  describe('logout', () => {
    it('clears all auth state', () => {
      const token = makeJwt({ type: 'admin', userId: 'u-4', roles: ['admin'] });
      useAuthStore.getState().setAccessToken(token);

      useAuthStore.getState().logout();
      const state = useAuthStore.getState();

      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.userType).toBeNull();
      expect(state.userId).toBeNull();
      expect(state.roles).toEqual([]);
    });

    it('marca isLogoutPending=true para que los guards redirijan a landing (no a /auth/login)', () => {
      const token = makeJwt({ type: 'user', userId: 'u-6', roles: ['user'] });
      useAuthStore.getState().setAccessToken(token);
      expect(useAuthStore.getState().isLogoutPending).toBe(false);

      useAuthStore.getState().logout();

      expect(useAuthStore.getState().isLogoutPending).toBe(true);
    });

    it('setAccessToken (login) limpia isLogoutPending', () => {
      useAuthStore.getState().logout();
      expect(useAuthStore.getState().isLogoutPending).toBe(true);

      const token = makeJwt({ type: 'user', userId: 'u-7', roles: ['user'] });
      useAuthStore.getState().setAccessToken(token);

      expect(useAuthStore.getState().isLogoutPending).toBe(false);
    });
  });
});
