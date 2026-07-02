import { mock } from 'jest-mock-extended';
import { AiFlashcardDraftGenerator } from '@/content/flashcard/application/generate-drafts/ai-flashcard-draft-generator';
import { type FlashcardDraftGeneratorPort } from '@/content/flashcard/domain/flashcard-draft-generator';
import { type FlashcardRepository } from '@/content/flashcard/domain/flashcard.repository';
import { CategoryValue } from '@/content/flashcard/domain/category';
import { ConnectedSpeechSubcategory } from '@/shared/domain/subcategory-taxonomy';
import { FlashcardMother } from '@test/content/flashcard/domain/flashcard-mother';
import { InvalidSubcategory } from '@/content/flashcard/domain/exceptions/invalid-subcategory';

describe('content/flashcard/application/generate-drafts AiFlashcardDraftGenerator', () => {
  const draftGenerator = mock<FlashcardDraftGeneratorPort>();
  const repository = mock<FlashcardRepository>();
  let useCase: AiFlashcardDraftGenerator;

  beforeEach(() => {
    draftGenerator.generate.mockReset();
    repository.match.mockReset();
    useCase = new AiFlashcardDraftGenerator(draftGenerator, repository);
  });

  it('should query existing expressions and pass them to the draft generator', async () => {
    repository.match.mockResolvedValue([
      FlashcardMother.random({ expression: 'gonna' }),
    ]);
    draftGenerator.generate.mockResolvedValue([
      {
        expression: 'wanna',
        meaning: 'quiero',
        category: CategoryValue.ConnectedSpeech,
        subcategory: ConnectedSpeechSubcategory.InformalGoingTo,
        ipaNotation: null,
        nativeSpeech: null,
        examples: [],
      },
    ]);

    const result = await useCase.execute({
      category: CategoryValue.ConnectedSpeech,
      subcategory: ConnectedSpeechSubcategory.InformalGoingTo,
      count: 5,
    });

    expect(repository.match).toHaveBeenCalled();
    expect(draftGenerator.generate).toHaveBeenCalledWith(
      expect.objectContaining({
        category: CategoryValue.ConnectedSpeech,
        subcategory: ConnectedSpeechSubcategory.InformalGoingTo,
        count: 5,
        existingExpressions: ['gonna'],
      }),
    );
    expect(result.drafts).toHaveLength(1);
  });

  it('should throw InvalidSubcategory when subcategory does not match category', async () => {
    await expect(
      useCase.execute({
        category: CategoryValue.NativeSounds,
        subcategory: ConnectedSpeechSubcategory.InformalGoingTo,
        count: 5,
      }),
    ).rejects.toThrow(InvalidSubcategory);

    expect(draftGenerator.generate).not.toHaveBeenCalled();
  });
});
