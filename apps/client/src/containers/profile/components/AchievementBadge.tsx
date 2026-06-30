import { type ReactElement, useEffect, useId, useRef, useState } from 'react';
import { BookOpen, Flame, Gamepad2, Info, Layers, Lock } from 'lucide-react';
import type { Locale } from '@/core/i18n';
import type {
  AchievementCategory,
  AchievementVM,
} from '@/core/achievements/achievement.types';

const categoryIcon: Record<AchievementCategory, typeof Gamepad2> = {
  game: Gamepad2,
  streak: Flame,
  module: Layers,
  study: BookOpen,
};

interface AchievementBadgeTooltipLabels {
  show: string;
  howToUnlock: string;
  unlocked: string;
  incentive: string;
}

interface AchievementBadgeProps {
  achievement: AchievementVM;
  title: string;
  description: string;
  unlockHint: string;
  incentive: string;
  tooltipLabels: AchievementBadgeTooltipLabels;
  locale: Locale;
}

function formatUnlockedDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-US', {
    dateStyle: 'medium',
  }).format(date);
}

export const AchievementBadge = ({
  achievement,
  title,
  description,
  unlockHint,
  incentive,
  tooltipLabels,
  locale,
}: AchievementBadgeProps): ReactElement => {
  const unlocked = achievement.unlockedAt !== null;
  const Icon = categoryIcon[achievement.category];
  const tooltipId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  useEffect(() => {
    if (!tooltipOpen) return;

    const handlePointerDown = (event: PointerEvent): void => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setTooltipOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [tooltipOpen]);

  return (
    <div ref={rootRef} className="group relative">
      <div
        data-testid={`achievement-badge-${achievement.key}`}
        className={`relative rounded-lg border p-3 pt-4 text-center transition-colors ${
          unlocked
            ? 'border-[var(--color-brand-dim)] bg-[var(--color-bg-elevated)]'
            : 'border-[var(--color-border)] opacity-80 hover:border-[var(--color-border-strong)] hover:opacity-100'
        }`}
      >
        {!unlocked ? (
          <Lock
            aria-hidden
            className="absolute right-2 top-2 h-3 w-3 text-[var(--color-text-muted)]"
          />
        ) : null}
        <Icon
          aria-hidden
          className={`mx-auto mb-2 h-6 w-6 ${
            unlocked
              ? 'text-[var(--color-brand)]'
              : 'text-[var(--color-text-muted)] grayscale'
          }`}
        />
        <p className="text-xs font-semibold text-[var(--color-text-primary)]">
          {title}
        </p>
        <button
          type="button"
          aria-label={tooltipLabels.show}
          aria-expanded={tooltipOpen}
          aria-controls={tooltipId}
          className="absolute bottom-1.5 right-1.5 rounded-full p-1 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-base)] hover:text-[var(--color-brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
          onClick={() => {
            setTooltipOpen((open) => !open);
          }}
        >
          <Info aria-hidden className="h-3.5 w-3.5" />
        </button>
      </div>

      <div
        id={tooltipId}
        {...(tooltipOpen
          ? { role: 'tooltip' as const }
          : { 'aria-hidden': true })}
        className={`profile-achievement-tooltip pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-[min(16rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] p-3 text-left shadow-lg transition-opacity ${
          tooltipOpen
            ? 'pointer-events-auto opacity-100'
            : 'opacity-0 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100'
        }`}
      >
        <p className="mb-1 text-sm font-semibold text-[var(--color-text-primary)]">
          {title}
        </p>
        <p className="mb-2 text-xs text-[var(--color-text-secondary)]">
          {description}
        </p>

        {unlocked && achievement.unlockedAt ? (
          <p className="text-xs font-medium text-[var(--color-brand)]">
            {tooltipLabels.unlocked}{' '}
            {formatUnlockedDate(achievement.unlockedAt, locale)}
          </p>
        ) : (
          <>
            <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              {tooltipLabels.howToUnlock}
            </p>
            <p className="mb-2 text-xs text-[var(--color-text-primary)]">
              {unlockHint}
            </p>
            <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              {tooltipLabels.incentive}
            </p>
            <p className="text-xs italic text-[var(--color-brand-light)]">
              {incentive}
            </p>
          </>
        )}
      </div>
    </div>
  );
};
