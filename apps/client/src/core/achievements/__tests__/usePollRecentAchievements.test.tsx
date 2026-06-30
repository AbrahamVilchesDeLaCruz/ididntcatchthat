import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { type ReactElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchAchievements } from '../useAchievements';
import { usePollRecentAchievements } from '../usePollRecentAchievements';
import { useToastStore } from '@/core/notifications/toast.store';

vi.mock('../useAchievements', () => ({
  fetchAchievements: vi.fn(),
}));

const mockedFetchAchievements = vi.mocked(fetchAchievements);

const wrapper =
  (queryClient: QueryClient) =>
  ({ children }: { children: ReactNode }): ReactElement => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

describe('usePollRecentAchievements', () => {
  beforeEach(() => {
    mockedFetchAchievements.mockReset();
    useToastStore.setState({ toasts: [] });
  });

  it('shows toast when recent achievements are returned', async () => {
    mockedFetchAchievements.mockResolvedValue([
      {
        key: 'first_game',
        category: 'game',
        sortOrder: 1,
        unlockedAt: new Date('2026-06-01T12:00:00.000Z'),
      },
    ]);

    const queryClient = new QueryClient();
    const { result } = renderHook(() => usePollRecentAchievements(), {
      wrapper: wrapper(queryClient),
    });

    await result.current.pollRecentUnlocks(
      new Date('2026-06-01T00:00:00.000Z'),
    );

    expect(useToastStore.getState().toasts).toHaveLength(1);
    expect(useToastStore.getState().toasts[0]?.message).toContain(
      'First steps',
    );
  }, 1000);

  it('does nothing when no recent achievements are returned', async () => {
    mockedFetchAchievements.mockResolvedValue([]);

    const queryClient = new QueryClient();
    const { result } = renderHook(() => usePollRecentAchievements(), {
      wrapper: wrapper(queryClient),
    });

    await result.current.pollRecentUnlocks(
      new Date('2026-06-01T00:00:00.000Z'),
    );

    expect(useToastStore.getState().toasts).toHaveLength(0);
    expect(mockedFetchAchievements).toHaveBeenCalledTimes(5);
  }, 20000);

  it('falls back to the achievement key when i18n title is missing', async () => {
    mockedFetchAchievements.mockResolvedValue([
      {
        key: 'unknown_key',
        category: 'game',
        sortOrder: 99,
        unlockedAt: new Date('2026-06-01T12:00:00.000Z'),
      },
    ]);

    const queryClient = new QueryClient();
    const { result } = renderHook(() => usePollRecentAchievements(), {
      wrapper: wrapper(queryClient),
    });

    await result.current.pollRecentUnlocks(
      new Date('2026-06-01T00:00:00.000Z'),
    );

    expect(useToastStore.getState().toasts[0]?.message).toContain(
      'unknown_key',
    );
  }, 1000);
});
