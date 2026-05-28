export interface GameFlashcardAudioUrls {
  expression: { us: string; uk: string; au: string };
  examples: { us: string };
}

export interface GameFlashcardExample {
  id: string;
  flashcardId: string;
  textEn: string;
  textEs: string;
  position: number;
}

export interface GameFlashcardDto {
  id: string;
  position: number;
  expression: string;
  meaning: string;
  category: string;
  subcategory: string;
  ipaNotation: string | null;
  nativeSpeech: string | null;
  audioUrls: GameFlashcardAudioUrls | null;
  examples: GameFlashcardExample[];
}

export interface GameFlashcardQuery {
  findByGameId(gameId: string): Promise<GameFlashcardDto[]>;
}

export const GAME_FLASHCARD_QUERY = Symbol('GameFlashcardQuery');
