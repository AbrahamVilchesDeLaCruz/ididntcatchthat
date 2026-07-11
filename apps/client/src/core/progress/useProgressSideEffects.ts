import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useI18n } from '@/core/i18n';
import { achievementKeys } from '@/core/achievements/achievementKeys';
import { fetchAchievements } from '@/core/achievements/useAchievements';
import { useToastStore } from '@/core/notifications/toast.store';
import { useAuthStore } from '@/core/store/auth.store';
import type { AchievementVM } from '@/core/achievements/achievement.types';
import {
  predictGameAchievementUnlocks,
  predictStudyAchievementUnlocks,
} from './predictAchievementUnlocks';
import {
  selectProgressOptimistic,
  useProgressOptimisticStore,
} from './progressOptimistic.store';
import { reconcileProgressWithBackoff } from './reconcileProgress';

const RETRY_DELAYS_MS = [300, 1000, 2000, 4000, 8000] as const;

function achievementTitle(
  items: Record<string, { title: string; description: string }>,
  key: string,
): string {
  return items[key]?.title ?? key;
}

function readCachedAchievements(
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string,
): AchievementVM[] | undefined {
  return queryClient.getQueryData<AchievementVM[]>(
    achievementKeys.list(userId),
  );
}

export function useProgressSideEffects(): {
  showOptimisticStudyUnlocks: () => void;
  showOptimisticGameUnlocks: () => void;
  pollRecentUnlocks: (since: Date) => Promise<void>;
  reconcileProgress: () => Promise<void>;
} {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const pushToast = useToastStore((s) => s.push);
  const userId = useAuthStore((s) => s.userId);

  const showPredictedUnlocks = useCallback(
    (predicted: { key: string; category: AchievementVM['category'] }[]) => {
      for (const achievement of predicted) {
        const title = achievementTitle(t.achievements.items, achievement.key);
        pushToast({
          key: `achievement:${achievement.key}`,
          message: t.achievements.toast.unlocked.replace('{title}', title),
          category: achievement.category,
        });
      }
    },
    [pushToast, t.achievements.items, t.achievements.toast.unlocked],
  );

  const showOptimisticStudyUnlocks = useCallback(() => {
    const optimistic = selectProgressOptimistic(
      useProgressOptimisticStore.getState(),
    );
    const achievements = readCachedAchievements(
      queryClient,
      userId ?? 'anonymous',
    );
    const predicted = predictStudyAchievementUnlocks(
      achievements,
      optimistic.extraStudySessions,
    );
    showPredictedUnlocks(predicted);
  }, [queryClient, showPredictedUnlocks, userId]);

  const showOptimisticGameUnlocks = useCallback(() => {
    const optimistic = selectProgressOptimistic(
      useProgressOptimisticStore.getState(),
    );
    const achievements = readCachedAchievements(
      queryClient,
      userId ?? 'anonymous',
    );
    const predicted = predictGameAchievementUnlocks(
      achievements,
      optimistic.extraGamesCompleted,
    );
    showPredictedUnlocks(predicted);
  }, [queryClient, showPredictedUnlocks, userId]);

  const pollRecentUnlocks = useCallback(
    async (since: Date): Promise<void> => {
      const sinceIso = since.toISOString();

      for (const delay of RETRY_DELAYS_MS) {
        await new Promise((resolve) => {
          window.setTimeout(resolve, delay);
        });

        const recent = await fetchAchievements(sinceIso);
        if (recent.length > 0) {
          for (const achievement of recent) {
            const title = achievementTitle(
              t.achievements.items,
              achievement.key,
            );
            pushToast({
              key: `achievement:${achievement.key}`,
              message: t.achievements.toast.unlocked.replace('{title}', title),
              category: achievement.category,
            });
          }

          void queryClient.invalidateQueries({
            queryKey: achievementKeys.all,
          });
          return;
        }
      }
    },
    [
      pushToast,
      queryClient,
      t.achievements.items,
      t.achievements.toast.unlocked,
    ],
  );

  const reconcileProgress = useCallback(async (): Promise<void> => {
    await reconcileProgressWithBackoff(queryClient);
  }, [queryClient]);

  return {
    showOptimisticStudyUnlocks,
    showOptimisticGameUnlocks,
    pollRecentUnlocks,
    reconcileProgress,
  };
}
