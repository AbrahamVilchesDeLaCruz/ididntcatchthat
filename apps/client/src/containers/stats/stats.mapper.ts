import type {
  ModuleProgressApiModel,
  SubcategoryProgressApiModel,
  WeakFlashcardApiModel,
} from './api/stats.api-model';
import type {
  ModuleProgressVM,
  SubcategoryProgressVM,
  WeakFlashcardVM,
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
