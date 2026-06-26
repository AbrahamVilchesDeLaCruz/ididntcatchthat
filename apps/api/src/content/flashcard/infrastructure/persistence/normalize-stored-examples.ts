import { randomUUID } from 'node:crypto';
import { type ExamplePrimitives } from '@/content/flashcard/domain/example';
import { UuidValueObject } from '@/shared/domain/uuid-value-object';

type StoredExample = Partial<ExamplePrimitives>;

/** Rellena campos faltantes en JSONB legacy (p. ej. seed sin id/flashcardId/position). */
export function normalizeStoredExamples(
  flashcardId: string,
  examples: StoredExample[],
): ExamplePrimitives[] {
  return examples.map((example, index) => {
    const position = [1, 2, 3].includes(example.position as number)
      ? (example.position as 1 | 2 | 3)
      : (Math.min(index + 1, 3) as 1 | 2 | 3);

    return {
      id:
        example.id && UuidValueObject.isValid(example.id)
          ? example.id
          : randomUUID(),
      flashcardId:
        example.flashcardId && UuidValueObject.isValid(example.flashcardId)
          ? example.flashcardId
          : flashcardId,
      textEn: example.textEn ?? '',
      textEs: example.textEs ?? '',
      position,
    };
  });
}
