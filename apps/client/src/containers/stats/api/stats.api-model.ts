// ─── Raw API models (shapes returned by the server) ──────────────────────────

export interface ModuleProgressApiModel {
  userId: string;
  module: string;
  totalAttempts: number;
  correctCount: number;
  accuracy: number;
  masteryLevel: number;
}

export interface WeakFlashcardApiModel {
  flashcardId: string;
  expression: string;
  module: string;
  category: string;
  subcategory: string;
  errorCount: number;
  lastSeenAt: string;
}
