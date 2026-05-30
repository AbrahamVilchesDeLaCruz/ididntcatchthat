import { randomUUID } from 'node:crypto';

export interface AttemptPrimitives {
  id: string;
  gameId: string;
  flashcardId: string;
  correct: boolean;
  answeredAt: Date;
}

export class Attempt {
  public constructor(
    readonly id: string,
    readonly gameId: string,
    readonly flashcardId: string,
    readonly correct: boolean,
    readonly answeredAt: Date,
  ) {}

  static create(
    gameId: string,
    flashcardId: string,
    correct: boolean,
  ): Attempt {
    return new Attempt(randomUUID(), gameId, flashcardId, correct, new Date());
  }

  static fromPrimitives(p: AttemptPrimitives): Attempt {
    return new Attempt(p.id, p.gameId, p.flashcardId, p.correct, p.answeredAt);
  }

  toPrimitives(): AttemptPrimitives {
    return {
      id: this.id,
      gameId: this.gameId,
      flashcardId: this.flashcardId,
      correct: this.correct,
      answeredAt: this.answeredAt,
    };
  }
}
