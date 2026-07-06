import type { Locale } from '@/core/i18n/i18n.types';
import type { RankingType } from './ranking.types';

export interface RankingScoreLabels {
  streakSuffix: string;
  levelPrefix: string;
}

const localeTag = (locale: Locale): string =>
  locale === 'es' ? 'es-ES' : 'en-US';

export function formatRankingScore(
  type: RankingType,
  score: number,
  locale: Locale = 'en',
  labels: RankingScoreLabels = { streakSuffix: 'd', levelPrefix: 'Lv.' },
): string {
  switch (type) {
    case 'most_accurate':
      return `${Math.round(score * 100)}%`;
    case 'best_streak':
      return `${Math.round(score)} ${labels.streakSuffix}`;
    case 'module_master':
      return `${labels.levelPrefix} ${Math.round(score)}`;
    default:
      return Math.round(score).toLocaleString(localeTag(locale));
  }
}

export function isPeriodIgnored(type: RankingType): boolean {
  return type === 'best_streak' || type === 'module_master';
}
