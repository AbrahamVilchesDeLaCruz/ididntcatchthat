import type {
  RankingEntryVM,
  RankingModule,
  RankingPeriod,
  RankingType,
  RankingViewerVM,
} from '../ranking.types';

export type RankingEntryApiModel = {
  rank: number;
  userId: string;
  nickname: string;
  score: number;
  isMe: boolean;
};

export type RankingViewerApiModel = RankingViewerVM;

export type RankingsApiModel = {
  entries: RankingEntryApiModel[];
  currentUser: Omit<RankingEntryVM, 'isMe'> | null;
  viewer: RankingViewerApiModel;
};

export type RankingProfileApiModel = {
  showInRanking: boolean;
  nickname: string;
};

export type RankingsQueryParams = {
  type: RankingType;
  period: RankingPeriod;
  module?: RankingModule;
  limit?: number;
};

export type { RankingEntryVM };
