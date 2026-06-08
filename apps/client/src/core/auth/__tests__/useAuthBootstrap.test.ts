/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import { useAuthBootstrap } from '../useAuthBootstrap';
import { useAuthStore } from '@/core/store/auth.store';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

// Helper para manipular el store directamente entre tests
const resetStore = (): void => {
  useAuthStore.setState({
    accessToken: null,
    isAuthenticated: false,
    guestDeviceId: null,
  });
};

describe('useAuthBootstrap', () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    resetStore();
  });

  it('devuelve ready=true inmediatamente si el usuario no está autenticado', () => {
    // isAuthenticated=false → no necesita refresh
    useAuthStore.setState({ isAuthenticated: false, accessToken: null });

    const { result } = renderHook(() => useAuthBootstrap());

    expect(result.current).toBe(true);
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it('devuelve ready=true inmediatamente si ya hay accessToken en memoria', () => {
    // isAuthenticated=true y accessToken presente → SPA activa, no recargó
    useAuthStore.setState({
      isAuthenticated: true,
      accessToken: 'existing-token',
    });

    const { result } = renderHook(() => useAuthBootstrap());

    expect(result.current).toBe(true);
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it('intenta refresh cuando isAuthenticated=true pero no hay accessToken (recarga)', async () => {
    // Simula recarga: isAuthenticated persistido pero accessToken efímero perdido
    useAuthStore.setState({ isAuthenticated: true, accessToken: null });
    mockedAxios.post = vi.fn().mockResolvedValue({
      data: { accessToken: 'new-token' },
    });

    const { result } = renderHook(() => useAuthBootstrap());

    // Durante el refresh, ready es false
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

  it('hace logout del guest cuando recarga (tiene guestDeviceId pero no accessToken)', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      accessToken: null,
      guestDeviceId: 'device-abc',
    });

    renderHook(() => useAuthBootstrap());

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().guestDeviceId).toBe('device-abc');
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });
});
