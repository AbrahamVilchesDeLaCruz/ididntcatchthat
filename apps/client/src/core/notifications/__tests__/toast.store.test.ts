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
});
