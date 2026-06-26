import { normalizeStoredExamples } from '@/content/flashcard/infrastructure/persistence/normalize-stored-examples';
import { UuidMother } from '@test/shared/domain/uuid-mother';

describe('normalizeStoredExamples', () => {
  const flashcardId = UuidMother.random();

  it('should fill missing id, flashcardId and position from legacy JSONB', () => {
    const [normalized] = normalizeStoredExamples(flashcardId, [
      { textEn: 'Hello', textEs: 'Hola' },
    ]);

    expect(normalized.flashcardId).toBe(flashcardId);
    expect(normalized.textEn).toBe('Hello');
    expect(normalized.textEs).toBe('Hola');
    expect(normalized.position).toBe(1);
    expect(normalized.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('should preserve complete example primitives', () => {
    const exampleId = UuidMother.random();
    const [normalized] = normalizeStoredExamples(flashcardId, [
      {
        id: exampleId,
        flashcardId,
        textEn: 'Hi',
        textEs: 'Hola',
        position: 2,
      },
    ]);

    expect(normalized).toEqual({
      id: exampleId,
      flashcardId,
      textEn: 'Hi',
      textEs: 'Hola',
      position: 2,
    });
  });
});
