import { type View } from './view';

export interface ViewRepository {
  save(view: View): Promise<void>;
  findByGameId(gameId: string): Promise<View[]>;
}

export const VIEW_REPOSITORY = Symbol('ViewRepository');
