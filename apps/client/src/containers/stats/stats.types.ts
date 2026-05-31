// ─── ViewModel types ──────────────────────────────────────────────────────────

export interface ModuleProgressVM {
  module: string;
  totalAttempts: number;
  correctCount: number;
  accuracy: number;
  masteryLevel: number;
}

export interface WeakFlashcardVM {
  flashcardId: string;
  module: string;
  errorCount: number;
  lastAttemptAt: Date;
}
