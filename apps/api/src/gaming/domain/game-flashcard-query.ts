import { type AudioUrlsPrimitives } from '@/content/flashcard/domain/audio-urls';
import { type ExamplePrimitives } from '@/content/flashcard/domain/example';

export interface GameFlashcardDto {
  id: string;
  position: number;
  expression: string;
  meaning: string;
  category: string;
  subcategory: string;
  ipaNotation: string | null;
  nativeSpeech: string | null;
  audioUrls: AudioUrlsPrimitives | null;
  examples: ExamplePrimitives[];
}

export interface GameFlashcardQuery {
  findByGameId(gameId: string): Promise<GameFlashcardDto[]>;
}

export const GAME_FLASHCARD_QUERY = Symbol('GameFlashcardQuery');
