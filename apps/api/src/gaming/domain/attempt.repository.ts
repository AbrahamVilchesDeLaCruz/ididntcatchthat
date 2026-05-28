import { type Attempt } from './attempt';

export interface AttemptRepository {
  save(attempt: Attempt): Promise<void>;
  findByGameId(gameId: string): Promise<Attempt[]>;
}

export const ATTEMPT_REPOSITORY = Symbol('AttemptRepository');
