import type { RankingEntryVM, RankingType } from './ranking.types';

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

export function getMedalEmoji(rank: number): string | null {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
}

export function isCurrentUser(
  entry: RankingEntryVM,
  currentUser: RankingEntryVM | null,
): boolean {
  return currentUser !== null && entry.userId === currentUser.userId;
}
