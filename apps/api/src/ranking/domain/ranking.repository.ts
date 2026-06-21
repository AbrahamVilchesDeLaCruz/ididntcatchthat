import { type Criteria } from '@/shared/domain/criteria';
import { type Ranking } from '@/ranking/domain/ranking';
import { type RankingId } from '@/ranking/domain/ranking-id';

export interface RankingRepository {
  save(ranking: Ranking): Promise<void>;
  search(id: RankingId): Promise<Ranking | null>;
  match(criteria: Criteria): Promise<Ranking[]>;
  remove(id: RankingId): Promise<void>;
}

export const RANKING_REPOSITORY = Symbol('RankingRepository');
