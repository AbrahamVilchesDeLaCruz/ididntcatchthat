import { type Criteria } from '@/shared/domain/criteria';
import { type RankingScore } from '@/ranking/projection/domain/ranking-score';
import { type RankingId } from '@/ranking/projection/domain/ranking-id';

export interface RankingScoreRepository {
  save(score: RankingScore): Promise<void>;
  search(id: RankingId): Promise<RankingScore | null>;
  match(criteria: Criteria): Promise<RankingScore[]>;
  remove(id: RankingId): Promise<void>;
}

export const RANKING_SCORE_REPOSITORY = Symbol('RankingScoreRepository');
