import { type RequestFlashcardCreator } from '@/content/flashcard/application/create/flashcard-creator';
import { CategoryValue } from '@/content/flashcard/domain/category';
import { MasteringSoundsSubcategory } from '@/content/flashcard/domain/subcategory-enums';
import { UuidMother } from '@test/shared/domain/uuid-mother';
import { StringMother } from '@test/shared/domain/string-mother';
import { ExampleMother } from '@test/content/flashcard/domain/example-mother';

export type { RequestFlashcardCreator } from '@/content/flashcard/application/create/flashcard-creator';

export class RequestFlashcardCreatorMother {
  static random(
    overrides?: Partial<RequestFlashcardCreator>,
  ): RequestFlashcardCreator {
    const id = overrides?.id ?? UuidMother.random();
    return {
      id,
      expression: overrides?.expression ?? StringMother.sentence(),
      meaning: overrides?.meaning ?? StringMother.sentence(),
      category: overrides?.category ?? CategoryValue.MasteringSounds,
      subcategory:
        overrides?.subcategory ?? MasteringSoundsSubcategory.FLAP_T_PARTY_CITY,
      ipaNotation: overrides?.ipaNotation ?? null,
      nativeSpeech: overrides?.nativeSpeech ?? null,
      examples: overrides?.examples ?? [ExampleMother.primitives(id, 1)],
      createdBy: overrides?.createdBy ?? UuidMother.random(),
    };
  }

  static withExamples(
    count: number,
    overrides?: Partial<RequestFlashcardCreator>,
  ): RequestFlashcardCreator {
    const id = overrides?.id ?? UuidMother.random();
    const examples = Array.from({ length: count }, (_, i) =>
      ExampleMother.primitives(id, (i + 1) as 1 | 2 | 3),
    );
    return { ...this.random({ ...overrides, id }), examples };
  }
}
