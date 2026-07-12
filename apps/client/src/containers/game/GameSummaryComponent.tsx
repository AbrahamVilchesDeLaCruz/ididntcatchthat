import { type ReactElement } from 'react';
import {
  Flame,
  RotateCcw,
  Sliders,
  BarChart3,
  Trophy,
  Repeat,
  Target,
  TrendingUp,
  ThumbsUp,
} from 'lucide-react';
import { useI18n } from '@/core/i18n';
import type { GameSummaryVM } from './game.types';

interface GameSummaryComponentProps {
  summary: GameSummaryVM;
  isGuest: boolean;
  pausedGamesCount?: number;
  onPlayAgain: () => void;
  onChooseModule: () => void;
  onViewPaused?: () => void;
  onRegister: () => void;
  onViewStats: () => void;
  onViewAchievements?: () => void;
  onPracticeWeakest?: () => void;
}

const getAccuracyTier = (
  pct: number,
): { Icon: typeof Flame; tint: string; label: string } => {
  if (pct >= 90)
    return {
      Icon: Flame,
      tint: 'text-[var(--color-accent-orange)]',
      label: 'fire',
    };
  if (pct >= 70)
    return {
      Icon: ThumbsUp,
      tint: 'text-[var(--color-accent-green)]',
      label: 'thumbs-up',
    };
  if (pct >= 50)
    return {
      Icon: TrendingUp,
      tint: 'text-[var(--color-brand-light)]',
      label: 'trending-up',
    };
  return {
    Icon: Target,
    tint: 'text-[var(--color-text-secondary)]',
    label: 'target',
  };
};

export const GameSummaryComponent = ({
  summary,
  isGuest,
  pausedGamesCount = 0,
  onPlayAgain,
  onChooseModule,
  onViewPaused,
  onRegister,
  onViewStats,
  onViewAchievements,
  onPracticeWeakest,
}: GameSummaryComponentProps): ReactElement => {
  const { t } = useI18n();
  const gs = t.game.summary;

  const accuracyPct = Math.round(summary.accuracy * 100);
  const { Icon: AccuracyIcon, tint: accuracyTint } =
    getAccuracyTier(accuracyPct);

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-[var(--color-bg-base)] px-5 py-12 md:py-16 lg:px-8">
      <div className="w-full max-w-sm md:max-w-xl lg:max-w-3xl">
        <div className="mb-3 flex justify-center">
          <AccuracyIcon
            size={56}
            strokeWidth={1.75}
            aria-hidden
            data-testid="summary-accuracy-icon"
            className={accuracyTint}
          />
        </div>
        <h1 className="mb-2 text-center text-3xl font-bold text-[var(--color-text-primary)] md:text-4xl">
          {gs.title}
        </h1>
        <p className="mb-10 text-center text-sm text-[var(--color-text-muted)]">
          {accuracyPct >= 70 ? gs.subtitleGood : gs.subtitleKeepGoing}
        </p>

        <div className="mb-10 grid grid-cols-3 gap-4">
          <StatCard label={gs.accuracy} value={`${accuracyPct}%`} highlight />
          <StatCard
            label={gs.correct}
            value={`${summary.correctCount}/${summary.totalCount}`}
          />
          <StatCard label={gs.total} value={String(summary.totalCount)} />
        </div>

        {(summary.failedCards?.length ?? 0) > 0 ? (
          <div className="mb-8 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
            <p className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
              {gs.failedCardsTitle}
            </p>
            <ul className="space-y-1 text-sm text-[var(--color-text-secondary)]">
              {summary.failedCards!.slice(0, 5).map((card) => (
                <li key={card.id}>{card.expression}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {isGuest ? (
          <div className="flex flex-col gap-3">
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-brand-dim)] bg-[var(--color-bg-elevated)] p-5 text-center">
              <p className="mb-1 text-sm font-semibold text-[var(--color-text-primary)]">
                {gs.registerTitle}
              </p>
              <p className="mb-4 text-xs text-[var(--color-text-muted)]">
                {gs.registerHint}
              </p>
              <button
                onClick={onRegister}
                className="w-full rounded-full bg-[var(--color-brand)] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
              >
                {gs.ctaRegister}
              </button>
            </div>

            <button
              onClick={onPlayAgain}
              className="rounded-full border border-[var(--color-border-strong)] py-3 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-text-primary)]"
            >
              {gs.ctaPlayAgain}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pausedGamesCount > 0 && onViewPaused ? (
              <button
                type="button"
                onClick={onViewPaused}
                className="rounded-full border border-[var(--color-brand-dim)] bg-[var(--color-brand-dim)]/30 py-3 text-sm font-medium text-[var(--color-brand-light)]"
              >
                {gs.pausedGamesLink.replace(
                  '{count}',
                  String(pausedGamesCount),
                )}
              </button>
            ) : null}

            <button
              onClick={onPlayAgain}
              className="flex items-center justify-center gap-2 rounded-full bg-[var(--color-brand)] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
            >
              <RotateCcw size={16} strokeWidth={2} aria-hidden />
              {gs.ctaPlayAgain}
            </button>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SecondaryAction
                icon={<Sliders size={16} strokeWidth={2} aria-hidden />}
                label={gs.ctaChooseModule}
                onClick={onChooseModule}
              />
              <SecondaryAction
                icon={<BarChart3 size={16} strokeWidth={2} aria-hidden />}
                label={gs.ctaViewStats}
                onClick={onViewStats}
              />
            </div>

            {onViewAchievements ? (
              <SecondaryAction
                icon={<Trophy size={16} strokeWidth={2} aria-hidden />}
                label={gs.ctaViewAchievements}
                onClick={onViewAchievements}
                accent="highlight"
              />
            ) : null}

            {onPracticeWeakest ? (
              <SecondaryAction
                icon={<Repeat size={16} strokeWidth={2} aria-hidden />}
                label={gs.ctaPracticeWeakest}
                onClick={onPracticeWeakest}
                accent="brand"
              />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  highlight?: boolean;
}

const StatCard = ({
  label,
  value,
  highlight = false,
}: StatCardProps): ReactElement => (
  <div className="flex flex-col items-center justify-center gap-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 md:p-6">
    <span
      className={[
        'text-2xl font-bold md:text-3xl',
        highlight
          ? 'text-[var(--color-brand-light)]'
          : 'text-[var(--color-text-primary)]',
      ].join(' ')}
    >
      {value}
    </span>
    <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
  </div>
);

interface SecondaryActionProps {
  icon: ReactElement;
  label: string;
  onClick: () => void;
  accent?: 'default' | 'highlight' | 'brand';
}

const SecondaryAction = ({
  icon,
  label,
  onClick,
  accent = 'default',
}: SecondaryActionProps): ReactElement => {
  const accentClass =
    accent === 'highlight'
      ? 'border-[var(--color-border-strong)] text-[var(--color-text-primary)] hover:border-[var(--color-brand-light)]'
      : accent === 'brand'
        ? 'border-[var(--color-brand)] text-[var(--color-brand-light)] hover:bg-[var(--color-brand)] hover:text-white'
        : 'border-[var(--color-border-strong)] text-[var(--color-text-muted)] hover:border-[var(--color-brand)] hover:text-[var(--color-text-primary)]';
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex items-center justify-center gap-2 rounded-full border py-3 text-sm font-medium transition-colors',
        accentClass,
      ].join(' ')}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};
