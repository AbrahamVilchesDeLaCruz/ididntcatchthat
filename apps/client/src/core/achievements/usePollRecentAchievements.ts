import { useProgressSideEffects } from '@/core/progress/useProgressSideEffects';

export function usePollRecentAchievements(): {
  pollRecentUnlocks: (since: Date) => Promise<void>;
} {
  const { pollRecentUnlocks } = useProgressSideEffects();
  return { pollRecentUnlocks };
}
