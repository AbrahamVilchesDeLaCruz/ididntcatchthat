import { mock } from 'jest-mock-extended';
import { FlashcardFinder } from '@/content/flashcard/application/find/flashcard-finder';
import { type FlashcardRepository } from '@/content/flashcard/domain/flashcard.repository';
import { FlashcardNotFound } from '@/content/flashcard/domain/exceptions/flashcard-not-found';
import { FlashcardMother } from '@test/content/flashcard/domain/flashcard-mother';
import { FlashcardIdMother } from '@test/content/flashcard/domain/flashcard-id-mother';

describe('content/flashcard/application/find FlashcardFinder', () => {
  const repository = mock<FlashcardRepository>();
  let finder: FlashcardFinder;

  beforeEach(() => {
    repository.search.mockReset();
    finder = new FlashcardFinder(repository);
  });

  it('should return primitives when flashcard exists', async () => {
    const flashcard = FlashcardMother.random();
    repository.search.mockResolvedValue(flashcard);

    const result = await finder.execute(flashcard.id.value);

    expect(result).toEqual(flashcard.toPrimitives());
  });

  it('should throw FlashcardNotFound when flashcard does not exist', async () => {
    repository.search.mockResolvedValue(null);

    await expect(
      finder.execute(FlashcardIdMother.random().value),
    ).rejects.toThrow(FlashcardNotFound);
  });
});
