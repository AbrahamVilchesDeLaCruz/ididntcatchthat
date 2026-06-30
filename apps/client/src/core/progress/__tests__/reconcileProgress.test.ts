import { describe, expect, it, vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { reconcileProgressWithBackoff } from '../reconcileProgress';

describe('reconcileProgressWithBackoff', () => {
  it('invalidates stats and achievements with backoff delays', async () => {
    vi.useFakeTimers();
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const promise = reconcileProgressWithBackoff(queryClient);

    await vi.runAllTimersAsync();
    await promise;

    expect(invalidateSpy).toHaveBeenCalled();
    expect(invalidateSpy.mock.calls.length).toBeGreaterThanOrEqual(10);

    vi.useRealTimers();
  });
});
