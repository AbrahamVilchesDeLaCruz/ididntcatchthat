import type { RankingType } from './ranking.types';

export function formatRankingScore(type: RankingType, score: number): string {
  switch (type) {
    case 'most_accurate':
      return `${Math.round(score * 100)}%`;
    case 'best_streak':
      return `${Math.round(score)} d`;
    case 'module_master':
      return `Nv. ${Math.round(score)}`;
    default:
      return Math.round(score).toLocaleString('es-ES');
  }
}

export function isPeriodIgnored(type: RankingType): boolean {
  return type === 'best_streak' || type === 'module_master';
}
