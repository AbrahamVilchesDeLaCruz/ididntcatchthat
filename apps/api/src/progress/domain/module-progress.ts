import { UserId } from '@/shared/domain/user-id';
import { ModuleName } from '@/progress/domain/module-name';
import { type UserFlashcardStats } from '@/progress/domain/user-flashcard-stats';

const MasteryThresholds = {
  LEVEL_3_ATTEMPTS: 20,
  LEVEL_3_ACCURACY: 0.85,
  LEVEL_2_ATTEMPTS: 10,
  LEVEL_2_ACCURACY: 0.7,
  LEVEL_1_ATTEMPTS: 5,
  LEVEL_1_ACCURACY: 0.5,
} as const;

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

export type ModuleProgressWithStudyPrimitives = ModuleProgressPrimitives & {
  studyLevel: number;
  studyCoverage: number;
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
    const previousLevel = existing?.masteryLevel ?? 0;
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
      levelIncreased: newLevel > previousLevel,
      newLevel,
      previousLevel,
    };
  }

  static computeMasteryLevel(totalAttempts: number, accuracy: number): number {
    if (
      totalAttempts >= MasteryThresholds.LEVEL_3_ATTEMPTS &&
      accuracy >= MasteryThresholds.LEVEL_3_ACCURACY
    )
      return 3;
    if (
      totalAttempts >= MasteryThresholds.LEVEL_2_ATTEMPTS &&
      accuracy >= MasteryThresholds.LEVEL_2_ACCURACY
    )
      return 2;
    if (
      totalAttempts >= MasteryThresholds.LEVEL_1_ATTEMPTS &&
      accuracy >= MasteryThresholds.LEVEL_1_ACCURACY
    )
      return 1;
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
