import type {
  ModuleProgressApiModel,
  SubcategoryProgressApiModel,
  WeakFlashcardApiModel,
  ProgressSummaryApiModel,
  AchievementApiModel,
} from './api/stats.api-model';
import type {
  ModuleProgressVM,
  SubcategoryProgressVM,
  WeakFlashcardVM,
  ProgressSummaryVM,
  AchievementVM,
} from './stats.types';

export function mapModuleProgress(
  raw: ModuleProgressApiModel,
): ModuleProgressVM {
  return {
    module: raw.module,
    totalAttempts: raw.totalAttempts,
    correctCount: raw.correctCount,
    // API stores 0–1; chart displays 0–100%.
    accuracy: raw.accuracy * 100,
    masteryLevel: raw.masteryLevel,
    studyLevel: raw.studyLevel,
    studyCoverage: raw.studyCoverage,
  };
}

export function mapWeakFlashcard(raw: WeakFlashcardApiModel): WeakFlashcardVM {
  return {
    flashcardId: raw.flashcardId,
    expression: raw.expression,
    module: raw.category ?? raw.module,
    category: raw.category ?? raw.module,
    subcategory: raw.subcategory,
    errorCount: raw.errorCount,
    lastAttemptAt: new Date(raw.lastSeenAt),
  };
}

export function mapSubcategoryProgress(
  raw: SubcategoryProgressApiModel,
): SubcategoryProgressVM {
  return {
    category: raw.category,
    subcategory: raw.subcategory,
    totalAttempts: raw.totalAttempts,
    correctCount: raw.correctCount,
    accuracy: raw.accuracy * 100,
  };
}

export function mapProgressSummary(
  raw: ProgressSummaryApiModel,
): ProgressSummaryVM {
  return {
    currentStreak: raw.currentStreak,
    longestStreak: raw.longestStreak,
    accuracy7d: raw.accuracy7d * 100,
    totalAttempts: raw.totalAttempts,
    weakCount: raw.weakCount,
    masteredCount: raw.masteredCount,
    gamesCompleted: raw.gamesCompleted,
    lastPlayedAt: raw.lastPlayedAt ? new Date(raw.lastPlayedAt) : null,
  };
}

export function mapAchievement(raw: AchievementApiModel): AchievementVM {
  return {
    key: raw.key,
    title: raw.title,
    description: raw.description,
    unlockedAt: raw.unlockedAt ? new Date(raw.unlockedAt) : null,
  };
}
