import { type ReactElement, useMemo } from 'react';
import { BookOpen, Flame, Gamepad2, Layers } from 'lucide-react';
import { useI18n } from '@/core/i18n';
import type {
  AchievementCategory,
  AchievementVM,
} from '@/core/achievements/achievement.types';
import { AchievementBadge } from './AchievementBadge';

const CATEGORY_ORDER: AchievementCategory[] = [
  'game',
  'streak',
  'module',
  'study',
];

const categorySectionIcon: Record<AchievementCategory, typeof Gamepad2> = {
  game: Gamepad2,
  streak: Flame,
  module: Layers,
  study: BookOpen,
};

interface ProfileAchievementsSectionProps {
  achievements: AchievementVM[];
  isLoading: boolean;
}

export const ProfileAchievementsSection = ({
  achievements,
  isLoading,
}: ProfileAchievementsSectionProps): ReactElement => {
  const { t, locale } = useI18n();
  const a = t.achievements;

  const unlockedCount = achievements.filter(
    (item) => item.unlockedAt !== null,
  ).length;
  const remaining = achievements.length - unlockedCount;
  const progressPct =
    achievements.length === 0
      ? 0
      : Math.round((unlockedCount / achievements.length) * 100);

  const grouped = useMemo(() => {
    const map = new Map<AchievementCategory, AchievementVM[]>();
    for (const category of CATEGORY_ORDER) {
      map.set(category, []);
    }
    for (const item of achievements) {
      map.get(item.category)?.push(item);
    }
    for (const [, list] of map) {
      list.sort((x, y) => x.sortOrder - y.sortOrder);
    }
    return map;
  }, [achievements]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
        <div className="h-6 w-40 animate-pulse rounded bg-[var(--color-bg-elevated)]" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
          {a.title}
        </h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          {a.progress
            .replace('{unlocked}', String(unlockedCount))
            .replace('{total}', String(achievements.length))}
        </p>
      </div>

      <div
        className="mb-4 h-2 overflow-hidden rounded-full bg-[var(--color-bg-base)]"
        role="progressbar"
        aria-valuenow={progressPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={a.progress
          .replace('{unlocked}', String(unlockedCount))
          .replace('{total}', String(achievements.length))}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-accent-green)] transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {achievements.length > 0 ? (
        <p className="mb-6 rounded-lg border border-[var(--color-brand-dim)] bg-[color-mix(in_srgb,var(--color-brand-dim)_45%,transparent)] px-3 py-2 text-sm text-[var(--color-text-secondary)]">
          {remaining > 0
            ? a.motivation.remaining.replace('{remaining}', String(remaining))
            : a.motivation.complete}
        </p>
      ) : null}

      <div className="space-y-6">
        {CATEGORY_ORDER.map((category) => {
          const items = grouped.get(category) ?? [];
          if (items.length === 0) return null;
          const SectionIcon = categorySectionIcon[category];
          return (
            <section
              key={category}
              aria-labelledby={`achievements-${category}`}
            >
              <div
                id={`achievements-${category}`}
                className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]"
              >
                <SectionIcon
                  aria-hidden
                  className="h-4 w-4 text-[var(--color-brand)]"
                />
                {a.categories[category]}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {items.map((item) => {
                  const copy =
                    a.items[item.key as keyof typeof a.items] ?? null;
                  return (
                    <AchievementBadge
                      key={item.key}
                      achievement={item}
                      title={copy?.title ?? item.key}
                      description={copy?.description ?? ''}
                      unlockHint={copy?.unlockHint ?? ''}
                      incentive={copy?.incentive ?? ''}
                      tooltipLabels={a.tooltip}
                      locale={locale}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
