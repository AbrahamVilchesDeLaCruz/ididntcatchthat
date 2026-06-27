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

export interface SubcategoryProgressApiModel {
  category: string;
  subcategory: string;
  totalAttempts: number;
  correctCount: number;
  accuracy: number;
}

export interface ProgressSummaryApiModel {
  currentStreak: number;
  longestStreak: number;
  accuracy7d: number;
  totalAttempts: number;
  weakCount: number;
  masteredCount: number;
  gamesCompleted: number;
  lastPlayedAt: string | null;
}

export interface AchievementApiModel {
  key: string;
  title: string;
  description: string;
  unlockedAt: string | null;
}
