import {
  Flashcard,
  type FlashcardPrimitives,
} from '@/content/flashcard/domain/flashcard';
import { CategoryValue } from '@/content/flashcard/domain/category';
import { NativeSoundsSubcategory } from '@/shared/domain/subcategory-taxonomy';
import { AudioStatusValue } from '@/content/flashcard/domain/audio-status';
import { FlashcardIdMother } from './flashcard-id-mother';
import { ExampleMother } from './example-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';
import { StringMother } from '@test/shared/domain/string-mother';

const DEFAULT_CATEGORY = CategoryValue.NativeSounds;
const DEFAULT_SUBCATEGORY = NativeSoundsSubcategory.VVacation;

export class FlashcardMother {
  static randomPrimitives(
    overrides?: Partial<FlashcardPrimitives>,
  ): FlashcardPrimitives {
    const id = overrides?.id ?? FlashcardIdMother.random().value;
    return {
      id,
      expression: overrides?.expression ?? StringMother.sentence(),
      meaning: overrides?.meaning ?? StringMother.sentence(),
      category: overrides?.category ?? DEFAULT_CATEGORY,
      subcategory: overrides?.subcategory ?? DEFAULT_SUBCATEGORY,
      ipaNotation: overrides?.ipaNotation ?? null,
      nativeSpeech: overrides?.nativeSpeech ?? null,
      audioStatus: overrides?.audioStatus ?? AudioStatusValue.Pending,
      audioUrls: overrides?.audioUrls ?? null,
      examples: overrides?.examples ?? [ExampleMother.primitives(id, 1)],
      createdBy: overrides?.createdBy ?? UuidMother.random(),
      deletedAt: overrides?.deletedAt ?? null,
    };
  }

  static random(overrides?: Partial<FlashcardPrimitives>): Flashcard {
    return Flashcard.fromPrimitives(
      FlashcardMother.randomPrimitives(overrides),
    );
  }
}
