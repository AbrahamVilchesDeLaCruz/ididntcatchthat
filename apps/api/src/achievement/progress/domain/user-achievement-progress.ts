import { AggregateRoot } from '@/shared/domain/aggregate-root';
import { UserId, type UserId as UserIdType } from '@/shared/domain/user-id';
import { ACTIVE_MODULES } from '@/achievement/shared/domain/active-modules';

export type UserAchievementProgressPrimitives = {
  userId: string;
  completedGamesCount: number;
  completedStudySessionsCount: number;
  totalPlayedAttempts: number;
  touchedModules: string[];
};

export class UserAchievementProgress extends AggregateRoot<UserAchievementProgressPrimitives> {
  private constructor(
    readonly userId: UserIdType,
    private _completedGamesCount: number,
    private _completedStudySessionsCount: number,
    private _totalPlayedAttempts: number,
    private _touchedModules: Set<string>,
  ) {
    super();
  }

  get completedGamesCount(): number {
    return this._completedGamesCount;
  }

  get completedStudySessionsCount(): number {
    return this._completedStudySessionsCount;
  }

  get totalPlayedAttempts(): number {
    return this._totalPlayedAttempts;
  }

  get touchedModules(): ReadonlySet<string> {
    return this._touchedModules;
  }

  static create(userId: UserId): UserAchievementProgress {
    return new UserAchievementProgress(userId, 0, 0, 0, new Set());
  }

  static fromPrimitives(
    primitives: UserAchievementProgressPrimitives,
  ): UserAchievementProgress {
    return new UserAchievementProgress(
      new UserId(primitives.userId),
      primitives.completedGamesCount,
      primitives.completedStudySessionsCount,
      primitives.totalPlayedAttempts,
      new Set(primitives.touchedModules),
    );
  }

  recordGameCompleted(module: string | null): void {
    this._completedGamesCount += 1;
    this.touchModule(module);
  }

  recordStudyCompleted(module: string | null): void {
    this._completedStudySessionsCount += 1;
    this.touchModule(module);
  }

  recordPlayedAttempt(flashcardModule: string | null): void {
    this._totalPlayedAttempts += 1;
    this.touchModule(flashcardModule);
  }

  recordStudiedModule(flashcardModule: string | null): void {
    this.touchModule(flashcardModule);
  }

  hasTouchedAllModules(): boolean {
    return ACTIVE_MODULES.every((module) => this._touchedModules.has(module));
  }

  toPrimitives(): UserAchievementProgressPrimitives {
    return {
      userId: this.userId.value,
      completedGamesCount: this._completedGamesCount,
      completedStudySessionsCount: this._completedStudySessionsCount,
      totalPlayedAttempts: this._totalPlayedAttempts,
      touchedModules: [...this._touchedModules],
    };
  }

  private touchModule(module: string | null): void {
    if (!module) return;
    this._touchedModules.add(module);
  }
}
