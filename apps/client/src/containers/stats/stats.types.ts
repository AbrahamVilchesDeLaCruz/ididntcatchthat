// ─── ViewModel types ──────────────────────────────────────────────────────────

export interface ModuleProgressVM {
  module: string;
  totalAttempts: number;
  correctCount: number;
  accuracy: number;
  masteryLevel: number;
  studyLevel: number;
  studyCoverage: number;
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

export interface ProgressSummaryVM {
  currentStreak: number;
  longestStreak: number;
  accuracy7d: number;
  totalAttempts: number;
  weakCount: number;
  masteredCount: number;
  gamesCompleted: number;
  lastPlayedAt: Date | null;
}

export interface AchievementVM {
  key: string;
  title: string;
  description: string;
  unlockedAt: Date | null;
}
