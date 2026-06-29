import { AggregateRoot } from '@/shared/domain/aggregate-root';
import { GameId } from './game-id';
import { GameMode } from './game-mode';
import { GameModule } from './game-module';
import { CardCount } from './card-count';
import { GameStatus, GameStatusValue } from './game-status';
import { Attempt, type AttemptPrimitives } from './attempt';
import { View, type ViewPrimitives } from './view';
import { AttemptRecordedEvent } from './events/attempt-recorded.event';
import { FlashcardViewedEvent } from './events/flashcard-viewed.event';
import { GameCompletedEvent } from './events/game-completed.event';
import { GamePausedEvent } from './events/game-paused.event';
import { GameAbandonedEvent } from './events/game-abandoned.event';
import { FlashcardNotInGame } from './exceptions/flashcard-not-in-game';
import { GameNotInProgress } from './exceptions/game-not-in-progress';
import { GameNotPaused } from './exceptions/game-not-paused';
import { GameNotFinished } from './exceptions/game-not-finished';
import { GameAlreadyFinished } from './exceptions/game-already-finished';
import { AttemptRequiresGameMode } from './exceptions/attempt-requires-game-mode';
import { ViewRequiresStudyMode } from './exceptions/view-requires-study-mode';
import { GameSource, GameSourceValue } from './game-source';

export interface GamePrimitives {
  id: string;
  userId: string | null;
  mode: string;
  module: string | null;
  subcategory: string | null;
  source: string;
  cardCount: string;
  status: string;
  flashcardIds: string[];
  lastFlashcardId: string | null;
  startedAt: Date;
  finishedAt: Date | null;
  attempts: AttemptPrimitives[];
  views: ViewPrimitives[];
}

export class Game extends AggregateRoot<GamePrimitives> {
  public constructor(
    readonly id: GameId,
    readonly userId: string | null,
    readonly mode: GameMode,
    readonly module: GameModule | null,
    readonly subcategory: string | null,
    readonly source: GameSource,
    readonly cardCount: CardCount,
    private _status: GameStatus,
    readonly flashcardIds: string[],
    private _lastFlashcardId: string | null,
    readonly startedAt: Date,
    private _finishedAt: Date | null,
    private _attempts: Attempt[],
    private _views: View[],
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

  get views(): View[] {
    return [...this._views];
  }

  static start(
    userId: string | null,
    mode: string,
    module: string | null,
    subcategory: string | null,
    source: string,
    cardCount: string,
    flashcardIds: string[],
  ): Game {
    return new Game(
      GameId.generate(),
      userId,
      GameMode.create(mode),
      module ? GameModule.create(module) : null,
      subcategory,
      GameSource.create(source),
      CardCount.create(cardCount),
      GameStatus.create(GameStatusValue.InProgress),
      flashcardIds,
      null,
      new Date(),
      null,
      [],
      [],
    );
  }

  recordAttempt(flashcardId: string, correct: boolean): Attempt {
    if (this.mode.isStudy()) {
      throw new AttemptRequiresGameMode(this.id.value);
    }
    if (!this._status.isInProgress()) {
      throw new GameNotInProgress(this.id.value);
    }
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
    return attempt;
  }

  recordView(flashcardId: string): View {
    if (!this.mode.isStudy()) {
      throw new ViewRequiresStudyMode(this.id.value);
    }
    if (!this._status.isInProgress()) {
      throw new GameNotInProgress(this.id.value);
    }
    if (!this.flashcardIds.includes(flashcardId)) {
      throw new FlashcardNotInGame(flashcardId, this.id.value);
    }
    const view = View.create(this.id.value, flashcardId);
    this._views.push(view);
    this.record(
      new FlashcardViewedEvent(this.id.value, {
        gameId: this.id.value,
        userId: this.userId,
        flashcardId,
        viewedAt: view.viewedAt.toISOString(),
      }),
    );
    return view;
  }

  pause(lastFlashcardId: string): void {
    if (!this._status.isInProgress()) {
      throw new GameNotInProgress(this.id.value);
    }
    this._status = GameStatus.create(GameStatusValue.Paused);
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
    if (!this._status.isPaused()) {
      throw new GameNotPaused(this.id.value);
    }
    this._status = GameStatus.create(GameStatusValue.InProgress);
  }

  complete(): void {
    const pending = this.pendingFlashcardIds();
    if (pending.length > 0) {
      throw new GameNotFinished(this.id.value, pending.length);
    }
    const finishedAt = new Date();
    this._finishedAt = finishedAt;
    this._status = GameStatus.create(GameStatusValue.Completed);
    const stats = this.completionStats();
    this.record(
      new GameCompletedEvent(this.id.value, {
        gameId: this.id.value,
        userId: this.userId,
        mode: this.mode.value,
        module: this.module?.value ?? null,
        subcategory: this.subcategory,
        source: this.source.value,
        cardCount: this.cardCount.value,
        correctCount: stats.correctCount,
        totalCount: stats.totalCount,
        startedAt: this.startedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
      }),
    );
  }

  abandon(): void {
    if (this._status.isFinished()) {
      throw new GameAlreadyFinished(this.id.value);
    }
    this._status = GameStatus.create(GameStatusValue.Abandoned);
    this.record(
      new GameAbandonedEvent(this.id.value, {
        gameId: this.id.value,
        userId: this.userId,
      }),
    );
  }

  completionStats(): {
    correctCount: number;
    totalCount: number;
    accuracy: number;
    duration: number;
    cardsViewed: number;
  } {
    if (this.mode.isStudy()) {
      const cardsViewed = this._views.length;
      const duration =
        this._finishedAt && this.startedAt
          ? Math.round(
              (this._finishedAt.getTime() - this.startedAt.getTime()) / 1000,
            )
          : 0;
      return {
        correctCount: 0,
        totalCount: cardsViewed,
        accuracy: 0,
        duration,
        cardsViewed,
      };
    }

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
    return {
      correctCount,
      totalCount,
      accuracy,
      duration,
      cardsViewed: totalCount,
    };
  }

  pendingFlashcardIds(): string[] {
    if (this.mode.isStudy()) {
      const viewed = new Set(this._views.map((v) => v.flashcardId));
      return this.flashcardIds.filter((id) => !viewed.has(id));
    }
    const answered = new Set(this._attempts.map((a) => a.flashcardId));
    return this.flashcardIds.filter((id) => !answered.has(id));
  }

  static fromPrimitives(p: GamePrimitives): Game {
    return new Game(
      new GameId(p.id),
      p.userId,
      GameMode.create(p.mode),
      p.module ? GameModule.create(p.module) : null,
      p.subcategory ?? null,
      GameSource.create(p.source ?? GameSourceValue.Catalog),
      CardCount.create(p.cardCount),
      GameStatus.create(p.status),
      p.flashcardIds,
      p.lastFlashcardId,
      p.startedAt,
      p.finishedAt,
      p.attempts.map((a) => Attempt.fromPrimitives(a)),
      (p.views ?? []).map((v) => View.fromPrimitives(v)),
    );
  }

  toPrimitives(): GamePrimitives {
    return {
      id: this.id.value,
      userId: this.userId,
      mode: this.mode.value,
      module: this.module?.value ?? null,
      subcategory: this.subcategory,
      source: this.source.value,
      cardCount: this.cardCount.value,
      status: this._status.value,
      flashcardIds: this.flashcardIds,
      lastFlashcardId: this._lastFlashcardId,
      startedAt: this.startedAt,
      finishedAt: this._finishedAt,
      attempts: this._attempts.map((a) => a.toPrimitives()),
      views: this._views.map((v) => v.toPrimitives()),
    };
  }
}
