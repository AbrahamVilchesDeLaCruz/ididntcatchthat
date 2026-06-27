// ─── Flashcard ViewModel ──────────────────────────────────────────────────────
export interface FlashcardGameVM {
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

// ─── Game session ─────────────────────────────────────────────────────────────
export interface GameSessionVM {
  gameId: string;
  flashcardIds: string[];
}

// ─── Summary ──────────────────────────────────────────────────────────────────
export interface GameSummaryVM {
  correctCount: number;
  totalCount: number;
  accuracy: number;
  duration: number;
  failedCards?: { id: string; expression: string }[];
}

// ─── Resume ───────────────────────────────────────────────────────────────────
export interface ResumeGameVM {
  gameId: string;
  pendingFlashcardIds: string[];
  lastFlashcardId: string | null;
}

// ─── Paused games ─────────────────────────────────────────────────────────────
export interface PausedGameVM {
  gameId: string;
  module: string | null;
  subcategory: string | null;
  cardCount: number;
  startedAt: Date;
  lastFlashcardId: string | null;
}
