import { AggregateRoot } from '@/shared/domain/aggregate-root';
import { UserId } from '@/shared/domain/user-id';
import { FlashcardId } from '@/shared/domain/flashcard-id';

export type UserFlashcardStatsPrimitives = {
  userId: string;
  flashcardId: string;
  timesStudied: number;
  timesPlayed: number;
  correctCount: number;
  accuracyRate: number;
  lastSeenAt: string;
};

export class UserFlashcardStats extends AggregateRoot<UserFlashcardStatsPrimitives> {
  private constructor(
    readonly userId: UserId,
    readonly flashcardId: FlashcardId,
    private _timesStudied: number,
    private _timesPlayed: number,
    private _correctCount: number,
    private _accuracyRate: number,
    private _lastSeenAt: Date,
  ) {
    super();
  }

  get timesStudied(): number {
    return this._timesStudied;
  }
  get timesPlayed(): number {
    return this._timesPlayed;
  }
  get correctCount(): number {
    return this._correctCount;
  }
  get accuracyRate(): number {
    return this._accuracyRate;
  }
  get lastSeenAt(): Date {
    return this._lastSeenAt;
  }

  static create(userId: UserId, flashcardId: FlashcardId): UserFlashcardStats {
    return new UserFlashcardStats(userId, flashcardId, 0, 0, 0, 0, new Date());
  }

  recordStudy(_correct: boolean): void {
    this._timesStudied++;
    // correctCount and accuracyRate are game-mode only (domain rule #5).
    // Study mode self-evaluation does not affect accuracy stats.
    this._lastSeenAt = new Date();
  }

  recordPlay(correct: boolean): void {
    this._timesPlayed++;
    if (correct) this._correctCount++;
    this._accuracyRate =
      this._timesPlayed === 0 ? 0 : this._correctCount / this._timesPlayed;
    this._lastSeenAt = new Date();
  }

  static fromPrimitives(p: UserFlashcardStatsPrimitives): UserFlashcardStats {
    return new UserFlashcardStats(
      new UserId(p.userId),
      new FlashcardId(p.flashcardId),
      p.timesStudied,
      p.timesPlayed,
      p.correctCount,
      p.accuracyRate,
      new Date(p.lastSeenAt),
    );
  }

  toPrimitives(): UserFlashcardStatsPrimitives {
    return {
      userId: this.userId.value,
      flashcardId: this.flashcardId.value,
      timesStudied: this._timesStudied,
      timesPlayed: this._timesPlayed,
      correctCount: this._correctCount,
      accuracyRate: this._accuracyRate,
      lastSeenAt: this._lastSeenAt.toISOString(),
    };
  }
}
