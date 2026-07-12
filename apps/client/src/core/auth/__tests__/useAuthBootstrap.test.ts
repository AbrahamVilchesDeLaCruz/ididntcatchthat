/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import { useAuthBootstrap } from '../useAuthBootstrap';
import { useAuthStore } from '@/core/store/auth.store';
import { redirectToLanding } from '../redirectToLanding';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

vi.mock('../redirectToLanding', () => ({
  redirectToLanding: vi.fn(),
  LANDING_PATH: '/',
}));
const mockedRedirect = vi.mocked(redirectToLanding);

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

describe('useAuthBootstrap', () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
    mockedRedirect.mockClear();
  });

  afterEach(() => {
    resetStore();
  });

  it('devuelve ready=true inmediatamente si el usuario no está autenticado', () => {
    useAuthStore.setState({ isAuthenticated: false, accessToken: null });

    const { result } = renderHook(() => useAuthBootstrap());

    expect(result.current).toBe(true);
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it('devuelve ready=true inmediatamente si ya hay accessToken en memoria', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      accessToken: 'existing-token',
    });

    const { result } = renderHook(() => useAuthBootstrap());

    expect(result.current).toBe(true);
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it('intenta refresh cuando isAuthenticated=true pero no hay accessToken (recarga)', async () => {
    useAuthStore.setState({ isAuthenticated: true, accessToken: null });
    mockedAxios.post = vi.fn().mockResolvedValue({
      data: { accessToken: 'new-token' },
    });

    const { result } = renderHook(() => useAuthBootstrap());

    expect(result.current).toBe(false);

    await waitFor(() => {
      expect(result.current).toBe(true);
    });

    expect(mockedAxios.post).toHaveBeenCalledOnce();
    expect(useAuthStore.getState().accessToken).toBe('new-token');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('hace logout y pone ready=true si el refresh falla (cookie expirada)', async () => {
    useAuthStore.setState({ isAuthenticated: true, accessToken: null });
    mockedAxios.post = vi.fn().mockRejectedValue(new Error('401'));

    const { result } = renderHook(() => useAuthBootstrap());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('restaura sesión guest al recargar (guestDeviceId sin accessToken)', async () => {
    useAuthStore.setState({
      isAuthenticated: true,
      accessToken: null,
      guestDeviceId: 'device-abc',
    });
    mockedAxios.post = vi.fn().mockResolvedValue({
      data: { accessToken: 'guest-token', deviceId: 'device-abc' },
    });

    const { result } = renderHook(() => useAuthBootstrap());

    expect(result.current).toBe(false);

    await waitFor(() => {
      expect(result.current).toBe(true);
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/auth/guest'),
      { guestDeviceId: 'device-abc' },
    );
    expect(useAuthStore.getState().accessToken).toBe('guest-token');
    expect(useAuthStore.getState().guestDeviceId).toBe('device-abc');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('hace logout del guest si la re-autenticación guest falla', async () => {
    useAuthStore.setState({
      isAuthenticated: true,
      accessToken: null,
      guestDeviceId: 'device-abc',
    });
    mockedAxios.post = vi.fn().mockRejectedValue(new Error('401'));

    const { result } = renderHook(() => useAuthBootstrap());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().guestDeviceId).toBe('device-abc');
  });

  it('redirige a landing cuando el refresh del usuario registrado falla', async () => {
    useAuthStore.setState({ isAuthenticated: true, accessToken: null });
    mockedAxios.post = vi.fn().mockRejectedValue(new Error('401'));

    renderHook(() => useAuthBootstrap());

    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    expect(mockedRedirect).toHaveBeenCalledOnce();
  });

  it('redirige a landing cuando la re-autenticación del guest falla', async () => {
    useAuthStore.setState({
      isAuthenticated: true,
      accessToken: null,
      guestDeviceId: 'device-abc',
    });
    mockedAxios.post = vi.fn().mockRejectedValue(new Error('401'));

    renderHook(() => useAuthBootstrap());

    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    expect(mockedRedirect).toHaveBeenCalledOnce();
  });

  it('no redirige cuando el refresh tiene éxito', async () => {
    useAuthStore.setState({ isAuthenticated: true, accessToken: null });
    mockedAxios.post = vi.fn().mockResolvedValue({
      data: { accessToken: 'new-token' },
    });

    renderHook(() => useAuthBootstrap());

    await waitFor(() => {
      expect(useAuthStore.getState().accessToken).toBe('new-token');
    });

    expect(mockedRedirect).not.toHaveBeenCalled();
  });
});
