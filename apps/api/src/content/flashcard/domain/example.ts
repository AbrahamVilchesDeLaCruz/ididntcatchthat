import { ExamplePositionInvalid } from './exceptions/example-position-invalid';
import { ExampleTextEnEmpty } from './exceptions/example-text-en-empty';
import { ExampleTextEsEmpty } from './exceptions/example-text-es-empty';

export type ExamplePrimitives = {
  id: string;
  flashcardId: string;
  textEn: string;
  textEs: string;
  position: number;
};

export class Example {
  private constructor(
    readonly id: string,
    readonly flashcardId: string,
    readonly textEn: string,
    readonly textEs: string,
    readonly position: number,
  ) {}

  static create(
    flashcardId: string,
    textEn: string,
    textEs: string,
    position: number,
  ): Example {
    if (![1, 2, 3].includes(position)) throw new ExamplePositionInvalid();
    if (!textEn?.trim()) throw new ExampleTextEnEmpty();
    if (!textEs?.trim()) throw new ExampleTextEsEmpty();

    return new Example(
      crypto.randomUUID(),
      flashcardId,
      textEn,
      textEs,
      position,
    );
  }

  static fromPrimitives(p: ExamplePrimitives): Example {
    return new Example(p.id, p.flashcardId, p.textEn, p.textEs, p.position);
  }

  toPrimitives(): ExamplePrimitives {
    return {
      id: this.id,
      flashcardId: this.flashcardId,
      textEn: this.textEn,
      textEs: this.textEs,
      position: this.position,
    };
  }
}
