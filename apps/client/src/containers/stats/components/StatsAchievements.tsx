import { type ReactElement } from 'react';
import { useI18n } from '@/core/i18n';
import type { AchievementVM } from '../stats.types';

interface StatsAchievementsProps {
  achievements: AchievementVM[];
  isLoading: boolean;
}

export const StatsAchievements = ({
  achievements,
  isLoading,
}: StatsAchievementsProps): ReactElement => {
  const { t } = useI18n();
  const a = t.achievements;

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
        <div className="h-6 w-32 animate-pulse rounded bg-[var(--color-bg-elevated)]" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
      <h2 className="mb-4 text-base font-semibold text-[var(--color-text-primary)]">
        {a.title}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {achievements.map((item) => {
          const unlocked = item.unlockedAt !== null;
          return (
            <div
              key={item.key}
              className={`rounded-lg border p-3 text-center ${
                unlocked
                  ? 'border-[var(--color-brand-dim)] bg-[var(--color-bg-elevated)]'
                  : 'border-[var(--color-border)] opacity-50 grayscale'
              }`}
              title={item.description}
            >
              <div className="mb-1 text-2xl">{unlocked ? '🏆' : '🔒'}</div>
              <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                {item.title}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
