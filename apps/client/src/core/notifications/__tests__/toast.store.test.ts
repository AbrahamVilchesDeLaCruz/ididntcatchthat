import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useToastStore } from '../toast.store';

const resetStore = (): void => {
  useToastStore.setState({ toasts: [] });
};

describe('toast.store', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetStore();
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(
      '00000000-0000-4000-8000-000000000000',
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('pushes a toast with a generated id', () => {
    useToastStore.getState().push({ message: 'Achievement unlocked' });

    expect(useToastStore.getState().toasts).toEqual([
      {
        id: '00000000-0000-4000-8000-000000000000',
        message: 'Achievement unlocked',
      },
    ]);
  });

  it('dismisses a toast by id', () => {
    useToastStore.getState().push({ message: 'First toast' });
    useToastStore.getState().dismiss('00000000-0000-4000-8000-000000000000');

    expect(useToastStore.getState().toasts).toEqual([]);
  });

  it('auto-dismisses a toast after five seconds', () => {
    useToastStore.getState().push({ message: 'Timed toast', category: 'game' });

    vi.advanceTimersByTime(5000);

    expect(useToastStore.getState().toasts).toEqual([]);
  });

  it('deduplica por key: dos push con la misma key NO añaden un segundo toast mientras el primero sigue vivo', () => {
    useToastStore.getState().push({
      key: 'achievement:first_game',
      message: 'First game unlocked',
      category: 'game',
    });
    useToastStore.getState().push({
      key: 'achievement:first_game',
      message: 'First game unlocked (again)',
      category: 'game',
    });

    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('First game unlocked');
  });

  it('permite un nuevo push con la misma key DESPUÉS de que el primero se haya dismissed', () => {
    useToastStore.getState().push({
      key: 'achievement:first_game',
      message: 'First',
    });
    const firstId = useToastStore.getState().toasts[0].id;
    useToastStore.getState().dismiss(firstId);

    useToastStore.getState().push({
      key: 'achievement:first_game',
      message: 'Second',
    });

    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('Second');
  });

  it('push sin key NO deduplica (varios toasts independientes)', () => {
    useToastStore.getState().push({ message: 'No key A' });
    useToastStore.getState().push({ message: 'No key B' });
    useToastStore.getState().push({ message: 'No key C' });

    expect(useToastStore.getState().toasts).toHaveLength(3);
  });
});
