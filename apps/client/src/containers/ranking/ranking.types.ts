export type RankingType =
  | 'most_active'
  | 'most_accurate'
  | 'top_scorer'
  | 'best_streak'
  | 'module_master';

export type RankingPeriod = 'weekly' | 'monthly' | 'all_time';

export type RankingModule =
  | 'native_sounds'
  | 'connected_speech'
  | 'flow_connectors'
  | 'real_talk';

export type RankingEntryVM = {
  rank: number;
  userId: string;
  nickname: string;
  score: number;
};

export type RankingProfileVM = {
  showInRanking: boolean;
  nickname: string;
};

export type RankingsVM = {
  entries: RankingEntryVM[];
  currentUser: RankingEntryVM | null;
};
