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

export type RankingViewerStatus = 'hidden' | 'visible_unranked' | 'ranked';

export type RankingEntryVM = {
  rank: number;
  userId: string;
  nickname: string;
  score: number;
  isMe: boolean;
};

export type RankingProfileVM = {
  showInRanking: boolean;
  nickname: string;
};

export type RankingViewerVM = {
  showInRanking: boolean;
  nickname: string;
  rank: number | null;
  score: number | null;
  status: RankingViewerStatus;
};

export type RankingsVM = {
  entries: RankingEntryVM[];
  currentUser: Omit<RankingEntryVM, 'isMe'> | null;
  viewer: RankingViewerVM;
};
