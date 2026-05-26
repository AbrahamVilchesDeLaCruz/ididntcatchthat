import { type Criteria } from '@/shared/domain/criteria';
import { type Game } from './game';
import { type GameId } from './game-id';

export interface GameRepository {
  save(game: Game): Promise<void>;
  search(id: GameId): Promise<Game | null>;
  match(criteria: Criteria): Promise<Game[]>;
}

export const GAME_REPOSITORY = Symbol('GameRepository');
