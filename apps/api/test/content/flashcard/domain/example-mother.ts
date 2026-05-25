import { Example } from '@/content/flashcard/domain/example';
import { UuidMother } from '@test/shared/domain/uuid-mother';
import { StringMother } from '@test/shared/domain/string-mother';

export class ExampleMother {
  static random(flashcardId?: string, position: 1 | 2 | 3 = 1): Example {
    return this.create(
      flashcardId ?? UuidMother.random(),
      StringMother.sentence(),
      StringMother.sentence(),
      position,
    );
  }

  static create(
    flashcardId: string,
    textEn: string,
    textEs: string,
    position: 1 | 2 | 3,
  ): Example {
    return new Example(
      UuidMother.random(),
      flashcardId,
      textEn,
      textEs,
      position,
    );
  }

  static primitives(
    flashcardId?: string,
    position: 1 | 2 | 3 = 1,
  ): {
    id: string;
    flashcardId: string;
    textEn: string;
    textEs: string;
    position: 1 | 2 | 3;
  } {
    return {
      id: UuidMother.random(),
      flashcardId: flashcardId ?? UuidMother.random(),
      textEn: StringMother.sentence(),
      textEs: StringMother.sentence(),
      position,
    };
  }
}
