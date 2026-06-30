import type { QueryClient } from '@tanstack/react-query';
import { statsKeys } from '@/containers/stats/api/stats.api';
import { achievementKeys } from '@/core/achievements/achievementKeys';

const RECONCILE_DELAYS_MS = [500, 1500, 3000, 6000, 10000] as const;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

export async function reconcileProgressWithBackoff(
  queryClient: QueryClient,
): Promise<void> {
  for (const delay of RECONCILE_DELAYS_MS) {
    await sleep(delay);
    await queryClient.invalidateQueries({ queryKey: statsKeys.all });
    await queryClient.invalidateQueries({ queryKey: achievementKeys.all });
  }
}
