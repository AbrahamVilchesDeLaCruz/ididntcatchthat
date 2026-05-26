// ─── Flashcard (GET /v1/games/:gameId/flashcards) ────────────────────────────
export interface FlashcardGameApiModel {
  id: string;
  position: number;
  expression: string;
  meaning: string;
  ipaNotation: string | null;
  nativeSpeech: string | null;
  audioUrls: {
    expression: { us: string; uk: string; au: string };
    examples: { us: string };
  } | null;
  examples: {
    id: string;
    textEn: string;
    textEs: string;
    position: number;
  }[];
}

// ─── Start game (POST /v1/games) ─────────────────────────────────────────────
export type GameModule =
  | 'native_sounds'
  | 'connecting_words'
  | 'beautifying_sentences'
  | 'sounding_native'
  | 'random';

export interface StartGamePayload {
  mode: 'game';
  module: GameModule | null;
  cardCount: 10 | 20 | 50;
}

export interface StartGameApiResponse {
  gameId: string;
  flashcardIds: string[];
}

// ─── Record attempt (POST /v1/games/:id/attempts) ────────────────────────────
export interface RecordAttemptPayload {
  flashcardId: string;
  correct: boolean;
}

// ─── Complete game (POST /v1/games/:id/complete) ─────────────────────────────
export interface GameSummaryApiModel {
  correctCount: number;
  totalCount: number;
  accuracy: number;
  duration: number;
}

// ─── Patch game (PATCH /v1/games/:id) ────────────────────────────────────────
export interface PatchGamePayload {
  status: 'paused' | 'abandoned';
  lastFlashcardId?: string;
}

// ─── Resume game (GET /v1/games/:id/resume) ───────────────────────────────────
export interface ResumeGameApiResponse {
  game: {
    id: string;
    userId: string | null;
    mode: string;
    module: string | null;
    cardCount: string;
    status: string;
    flashcardIds: string[];
    lastFlashcardId: string | null;
    startedAt: string;
    finishedAt: string | null;
    attempts: { flashcardId: string; correct: boolean; answeredAt: string }[];
  };
  pendingFlashcardIds: string[];
}
