import { AggregateRoot } from '@/shared/domain/aggregate-root';
import { GameId } from './game-id';
import { GameMode } from './game-mode';
import { GameModule } from './game-module';
import { CardCount } from './card-count';
import { GameStatus } from './game-status';
import { Attempt, type AttemptPrimitives } from './attempt';
import { AttemptRecordedEvent } from './events/attempt-recorded.event';
import { GameCompletedEvent } from './events/game-completed.event';
import { GamePausedEvent } from './events/game-paused.event';
import { GameAbandonedEvent } from './events/game-abandoned.event';
import { FlashcardNotInGame } from './exceptions/flashcard-not-in-game';
import { GameNotInProgress } from './exceptions/game-not-in-progress';
import { GameNotPaused } from './exceptions/game-not-paused';
import { GameNotFinished } from './exceptions/game-not-finished';
import { GameAlreadyFinished } from './exceptions/game-already-finished';

export interface GamePrimitives {
  id: string;
  userId: string | null;
  mode: string;
  module: string | null;
  cardCount: string;
  status: string;
  flashcardIds: string[];
  lastFlashcardId: string | null;
  startedAt: Date;
  finishedAt: Date | null;
  attempts: AttemptPrimitives[];
}

export class Game extends AggregateRoot<GamePrimitives> {
  private constructor(
    readonly id: GameId,
    readonly userId: string | null,
    readonly mode: GameMode,
    readonly module: GameModule | null,
    readonly cardCount: CardCount,
    private _status: GameStatus,
    readonly flashcardIds: string[],
    private _lastFlashcardId: string | null,
    readonly startedAt: Date,
    private _finishedAt: Date | null,
    private _attempts: Attempt[],
  ) {
    super();
  }

  get status(): GameStatus {
    return this._status;
  }

  get lastFlashcardId(): string | null {
    return this._lastFlashcardId;
  }

  get finishedAt(): Date | null {
    return this._finishedAt;
  }

  get attempts(): Attempt[] {
    return [...this._attempts];
  }

  static start(
    userId: string | null,
    mode: string,
    module: string | null,
    cardCount: string,
    flashcardIds: string[],
  ): Game {
    return new Game(
      GameId.generate(),
      userId,
      GameMode.create(mode),
      module ? GameModule.create(module) : null,
      CardCount.create(cardCount),
      GameStatus.create('in_progress'),
      flashcardIds,
      null,
      new Date(),
      null,
      [],
    );
  }

  recordAttempt(flashcardId: string, correct: boolean): void {
    if (!this.flashcardIds.includes(flashcardId)) {
      throw new FlashcardNotInGame(flashcardId, this.id.value);
    }
    const attempt = Attempt.create(this.id.value, flashcardId, correct);
    this._attempts.push(attempt);
    this.record(
      new AttemptRecordedEvent(this.id.value, {
        gameId: this.id.value,
        userId: this.userId,
        flashcardId,
        correct,
        mode: this.mode.value,
        answeredAt: attempt.answeredAt.toISOString(),
      }),
    );
  }

  pause(lastFlashcardId: string): void {
    if (this._status.value !== 'in_progress') {
      throw new GameNotInProgress(this.id.value);
    }
    this._status = GameStatus.create('paused');
    this._lastFlashcardId = lastFlashcardId;
    this.record(
      new GamePausedEvent(this.id.value, {
        gameId: this.id.value,
        userId: this.userId,
        lastFlashcardId,
      }),
    );
  }

  resume(): void {
    if (this._status.value !== 'paused') {
      throw new GameNotPaused(this.id.value);
    }
    this._status = GameStatus.create('in_progress');
  }

  complete(): void {
    const pending = this.pendingFlashcardIds();
    if (pending.length > 0) {
      throw new GameNotFinished(this.id.value, pending.length);
    }
    const finishedAt = new Date();
    this._finishedAt = finishedAt;
    this._status = GameStatus.create('completed');
    this.record(
      new GameCompletedEvent(this.id.value, {
        gameId: this.id.value,
        userId: this.userId,
        mode: this.mode.value,
        module: this.module?.value ?? null,
        cardCount: this.cardCount.value,
        startedAt: this.startedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
      }),
    );
  }

  abandon(): void {
    if (
      this._status.value === 'completed' ||
      this._status.value === 'abandoned'
    ) {
      throw new GameAlreadyFinished(this.id.value);
    }
    this._status = GameStatus.create('abandoned');
    this.record(
      new GameAbandonedEvent(this.id.value, {
        gameId: this.id.value,
        userId: this.userId,
      }),
    );
  }

  getCompletionStats(): {
    correctCount: number;
    totalCount: number;
    accuracy: number;
    duration: number;
  } {
    const totalCount = this._attempts.length;
    const correctCount = this._attempts.filter((a) => a.correct).length;
    const accuracy =
      totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    const duration =
      this._finishedAt && this.startedAt
        ? Math.round(
            (this._finishedAt.getTime() - this.startedAt.getTime()) / 1000,
          )
        : 0;
    return { correctCount, totalCount, accuracy, duration };
  }

  pendingFlashcardIds(): string[] {
    const answered = new Set(this._attempts.map((a) => a.flashcardId));
    return this.flashcardIds.filter((id) => !answered.has(id));
  }

  static fromPrimitives(p: GamePrimitives): Game {
    return new Game(
      new GameId(p.id),
      p.userId,
      GameMode.create(p.mode),
      p.module ? GameModule.create(p.module) : null,
      CardCount.create(p.cardCount),
      GameStatus.create(p.status),
      p.flashcardIds,
      p.lastFlashcardId,
      p.startedAt,
      p.finishedAt,
      p.attempts.map((a) => Attempt.fromPrimitives(a)),
    );
  }

  toPrimitives(): GamePrimitives {
    return {
      id: this.id.value,
      userId: this.userId,
      mode: this.mode.value,
      module: this.module?.value ?? null,
      cardCount: this.cardCount.value,
      status: this._status.value,
      flashcardIds: this.flashcardIds,
      lastFlashcardId: this._lastFlashcardId,
      startedAt: this.startedAt,
      finishedAt: this._finishedAt,
      attempts: this._attempts.map((a) => a.toPrimitives()),
    };
  }
}
