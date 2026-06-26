import { type GameModule } from './game-module';

export interface FlashcardSelector {
  select(
    module: GameModule | null,
    subcategory: string | null,
    count: number,
  ): Promise<string[]>;
}

export const FLASHCARD_SELECTOR = Symbol('FlashcardSelector');
