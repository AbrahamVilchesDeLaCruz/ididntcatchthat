import { UuidValueObject } from '@/shared/domain/uuid-value-object';
import { ExamplePositionInvalid } from './exceptions/example-position-invalid';
import { ExampleTextEnEmpty } from './exceptions/example-text-en-empty';
import { ExampleTextEsEmpty } from './exceptions/example-text-es-empty';
import { FlashcardIdInvalid } from '@/shared/domain/exceptions/flashcard-id-invalid';
import { ExampleIdInvalid } from './exceptions/example-id-invalid';

export type ExamplePrimitives = {
  id: string;
  flashcardId: string;
  textEn: string;
  textEs: string;
  position: number;
};

export class Example {
  constructor(
    readonly id: string,
    readonly flashcardId: string,
    readonly textEn: string,
    readonly textEs: string,
    readonly position: number,
  ) {
    this.ensureIdIsValid(id);
    this.ensureFlashcardIdIsValid(flashcardId);
    this.ensurePositionIsValid(position);
    this.ensureTextEnIsNotEmpty(textEn);
    this.ensureTextEsIsNotEmpty(textEs);
  }

  private ensureIdIsValid(id: string): void {
    if (!UuidValueObject.isValid(id)) throw new ExampleIdInvalid();
  }

  private ensureFlashcardIdIsValid(flashcardId: string): void {
    if (!UuidValueObject.isValid(flashcardId)) throw new FlashcardIdInvalid();
  }

  private ensurePositionIsValid(position: number): void {
    if (![1, 2, 3].includes(position)) throw new ExamplePositionInvalid();
  }

  private ensureTextEnIsNotEmpty(textEn: string): void {
    if (!textEn?.trim()) throw new ExampleTextEnEmpty();
  }

  private ensureTextEsIsNotEmpty(textEs: string): void {
    if (!textEs?.trim()) throw new ExampleTextEsEmpty();
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
