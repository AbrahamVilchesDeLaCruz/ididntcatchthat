import { UserId } from '@/shared/domain/user-id';
import { ModuleName } from '@/progress/domain/module-name';

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
