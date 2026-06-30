import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useI18n } from '@/core/i18n';
import { achievementKeys } from '@/core/achievements/achievementKeys';
import { fetchAchievements } from '@/core/achievements/useAchievements';
import { useToastStore } from '@/core/notifications/toast.store';

const RETRY_DELAYS_MS = [300, 1000, 2000] as const;

function achievementTitle(
  items: Record<string, { title: string; description: string }>,
  key: string,
): string {
  return items[key]?.title ?? key;
}

export function usePollRecentAchievements(): {
  pollRecentUnlocks: (since: Date) => Promise<void>;
} {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const pushToast = useToastStore((s) => s.push);

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
    [pushToast, queryClient, t.achievements.items, t.achievements.toast],
  );

  return { pollRecentUnlocks };
}
