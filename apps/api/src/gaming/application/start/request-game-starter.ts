import { type GameSourceValue } from '@/gaming/domain/game-source';

export type RequestGameStarter = {
  userId: string | null;
  mode: string;
  module: string | null;
  subcategory: string | null;
  cardCount: number;
  source?: GameSourceValue;
};
