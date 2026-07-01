/**
 * Cross-BC SQL contract for {@link TypeOrmRankingUserStatsQuery}.
 * If Gaming/Progress rename columns, update entities AND this contract together.
 */
export const RANKING_USER_STATS_SQL_CONTRACT = {
  games: {
    table: 'games',
    columns: ['user_id', 'mode', 'status', 'finished_at'],
  },
  userFlashcardStats: {
    table: 'user_flashcard_stats',
    columns: [
      'user_id',
      'times_played',
      'accuracy_rate',
      'correct_count',
      'last_seen_at',
    ],
  },
  moduleProgress: {
    table: 'module_progress',
    columns: ['user_id', 'module', 'mastery_level'],
  },
} as const;

export type RankingUserStatsSqlContract =
  typeof RANKING_USER_STATS_SQL_CONTRACT;
