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
  expression: string;
  module: string;
  category: string;
  subcategory: string;
  errorCount: number;
  lastAttemptAt: Date;
}

export interface SubcategoryProgressVM {
  category: string;
  subcategory: string;
  totalAttempts: number;
  correctCount: number;
  accuracy: number;
}
