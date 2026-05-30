import { type GamePrimitives } from '@/gaming/domain/game';

export type ResponseGameResumer = {
  game: GamePrimitives;
  pendingFlashcardIds: string[];
};
