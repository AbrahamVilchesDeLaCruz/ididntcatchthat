import { UserId } from '@/shared/domain/user-id';
import { ModuleName } from '@/progress/domain/module-name';
import { type UserFlashcardStats } from '@/progress/domain/user-flashcard-stats';

export type ModuleProgressPrimitives = {
  userId: string;
  module: string;
  totalAttempts: number;
  correctCount: number;
  accuracy: number;
  masteryLevel: number;
  lastPlayedAt: string;
  updatedAt: string;
};

export type ModuleProgressComputation = {
  progress: ModuleProgress;
  levelIncreased: boolean;
  newLevel: number;
  previousLevel: number;
};

export class ModuleProgress {
  constructor(
    readonly userId: UserId,
    readonly module: ModuleName,
    readonly totalAttempts: number,
    readonly correctCount: number,
    readonly accuracy: number,
    readonly masteryLevel: number,
    readonly lastPlayedAt: Date,
    readonly updatedAt: Date,
  ) {}

  static computeFrom(
    allStats: UserFlashcardStats[],
    existing: ModuleProgress | null,
    userId: UserId,
    module: ModuleName,
  ): ModuleProgressComputation {
    const totalAttempts = allStats.reduce((sum, s) => sum + s.timesPlayed, 0);
    const correctCount = allStats.reduce((sum, s) => sum + s.correctCount, 0);
    const accuracy = totalAttempts === 0 ? 0 : correctCount / totalAttempts;
    const newLevel = ModuleProgress.computeMasteryLevel(
      totalAttempts,
      accuracy,
    );
    const previousLevel = existing?.masteryLevel ?? -1;
    const now = new Date();

    const progress = new ModuleProgress(
      userId,
      module,
      totalAttempts,
      correctCount,
      accuracy,
      newLevel,
      now,
      now,
    );

    return {
      progress,
      levelIncreased: newLevel > previousLevel && previousLevel >= 0,
      newLevel,
      previousLevel,
    };
  }

  static computeMasteryLevel(totalAttempts: number, accuracy: number): number {
    if (totalAttempts >= 20 && accuracy >= 0.85) return 3;
    if (totalAttempts >= 10 && accuracy >= 0.7) return 2;
    if (totalAttempts >= 5 && accuracy >= 0.5) return 1;
    return 0;
  }

  static fromPrimitives(p: ModuleProgressPrimitives): ModuleProgress {
    return new ModuleProgress(
      new UserId(p.userId),
      ModuleName.create(p.module),
      p.totalAttempts,
      p.correctCount,
      p.accuracy,
      p.masteryLevel,
      new Date(p.lastPlayedAt),
      new Date(p.updatedAt),
    );
  }

  toPrimitives(): ModuleProgressPrimitives {
    return {
      userId: this.userId.value,
      module: this.module.value,
      totalAttempts: this.totalAttempts,
      correctCount: this.correctCount,
      accuracy: this.accuracy,
      masteryLevel: this.masteryLevel,
      lastPlayedAt: this.lastPlayedAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
