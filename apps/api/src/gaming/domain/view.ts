import { randomUUID } from 'crypto';

export type ViewPrimitives = {
  id: string;
  gameId: string;
  flashcardId: string;
  viewedAt: Date;
};

export class View {
  public constructor(
    readonly id: string,
    readonly gameId: string,
    readonly flashcardId: string,
    readonly viewedAt: Date,
  ) {}

  static create(gameId: string, flashcardId: string): View {
    return new View(randomUUID(), gameId, flashcardId, new Date());
  }

  static fromPrimitives(p: ViewPrimitives): View {
    return new View(p.id, p.gameId, p.flashcardId, p.viewedAt);
  }

  toPrimitives(): ViewPrimitives {
    return {
      id: this.id,
      gameId: this.gameId,
      flashcardId: this.flashcardId,
      viewedAt: this.viewedAt,
    };
  }
}
