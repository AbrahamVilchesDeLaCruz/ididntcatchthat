import type {
  RankingEntryVM,
  RankingPeriod,
  RankingType,
  RankingModule,
} from '../ranking.types';

export type RankingEntryApiModel = {
  rank: number;
  userId: string;
  nickname: string;
  score: number;
};

export type RankingsApiModel = {
  entries: RankingEntryApiModel[];
  currentUser: RankingEntryApiModel | null;
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
