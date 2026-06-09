import type {
  ModuleProgressApiModel,
  WeakFlashcardApiModel,
} from './api/stats.api-model';
import type { ModuleProgressVM, WeakFlashcardVM } from './stats.types';

export function mapModuleProgress(
  raw: ModuleProgressApiModel,
): ModuleProgressVM {
  return {
    module: raw.module,
    totalAttempts: raw.totalAttempts,
    correctCount: raw.correctCount,
    accuracy: raw.accuracy,
    masteryLevel: raw.masteryLevel,
  };
}

export function mapWeakFlashcard(raw: WeakFlashcardApiModel): WeakFlashcardVM {
  return {
    flashcardId: raw.flashcardId,
    expression: raw.expression,
    module: raw.module,
    errorCount: raw.errorCount,
    lastAttemptAt: new Date(raw.lastSeenAt),
  };
}
