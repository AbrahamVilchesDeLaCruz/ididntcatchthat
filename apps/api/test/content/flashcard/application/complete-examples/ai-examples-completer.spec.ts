import { mock } from 'jest-mock-extended';
import { type FlashcardRepository } from '@/content/flashcard/domain/flashcard.repository';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { type AiExampleGenerator } from '@/content/flashcard/domain/ai-example-generator';
import { AiExamplesCompleter } from '@/content/flashcard/application/complete-examples/ai-examples-completer';
import { FlashcardExamplesCompletedEvent } from '@/content/flashcard/domain/events/flashcard-examples-completed.event';
import { type DomainEvent } from '@/shared/domain/domain-event';
import { FlashcardMother } from '@test/content/flashcard/domain/flashcard-mother';
import { ExampleMother } from '@test/content/flashcard/domain/example-mother';
import { StringMother } from '@test/shared/domain/string-mother';
import { RequestAiExamplesCompleterMother } from './request-ai-examples-completer-mother';
import { FlashcardIdMother } from '@test/content/flashcard/domain/flashcard-id-mother';

describe('content/flashcard/application/complete-examples AiExamplesCompleter', () => {
  const repository = mock<FlashcardRepository>();
  const publisher = mock<DomainEventPublisher>();
  const aiExampleGenerator = mock<AiExampleGenerator>();
  let useCase: AiExamplesCompleter;

  beforeEach(() => {
    repository.search.mockReset();
    repository.save.mockReset();
    publisher.publish.mockReset();
    aiExampleGenerator.generate.mockReset();

    publisher.publish.mockResolvedValue(undefined);
    repository.save.mockResolvedValue(undefined);

    useCase = new AiExamplesCompleter(
      repository,
      publisher,
      aiExampleGenerator,
    );
  });

  it('should generate 3 examples and publish FlashcardExamplesCompletedEvent when flashcard has no examples', async () => {
    const flashcard = FlashcardMother.random({ examples: [] });
    repository.search.mockResolvedValue(flashcard);

    const generated = [
      { textEn: StringMother.sentence(), textEs: StringMother.sentence() },
      { textEn: StringMother.sentence(), textEs: StringMother.sentence() },
      { textEn: StringMother.sentence(), textEs: StringMother.sentence() },
    ];
    aiExampleGenerator.generate.mockResolvedValue(generated);

    await useCase.execute(
      RequestAiExamplesCompleterMother.random({
        flashcardId: flashcard.id.value,
      }),
    );

    expect(aiExampleGenerator.generate).toHaveBeenCalledWith(
      flashcard.expression.value,
      flashcard.category.value,
    );
    expect(repository.save).toHaveBeenCalled();
    const events: DomainEvent[] = publisher.publish.mock.calls[0][0];
    expect(events[0]).toBeInstanceOf(FlashcardExamplesCompletedEvent);

    const savedFlashcard = repository.save.mock.calls[0][0];
    expect(savedFlashcard.examples).toHaveLength(3);
  });

  it('should complete up to 3 examples when flashcard already has 1 example', async () => {
    const existingExamplePrimitive = ExampleMother.primitives(undefined, 1);
    const flashcard = FlashcardMother.random({
      examples: [existingExamplePrimitive],
    });
    repository.search.mockResolvedValue(flashcard);

    const generated = [
      { textEn: StringMother.sentence(), textEs: StringMother.sentence() },
      { textEn: StringMother.sentence(), textEs: StringMother.sentence() },
    ];
    aiExampleGenerator.generate.mockResolvedValue(generated);

    await useCase.execute(
      RequestAiExamplesCompleterMother.random({
        flashcardId: flashcard.id.value,
      }),
    );

    const savedFlashcard = repository.save.mock.calls[0][0];
    expect(savedFlashcard.examples).toHaveLength(3);
    const events: DomainEvent[] = publisher.publish.mock.calls[0][0];
    expect(events[0]).toBeInstanceOf(FlashcardExamplesCompletedEvent);
  });

  it('should NOT call AI generator and still publish when flashcard already has 3 examples', async () => {
    const id = FlashcardIdMother.random().value;
    const flashcard = FlashcardMother.random({
      examples: [
        ExampleMother.primitives(id, 1),
        ExampleMother.primitives(id, 2),
        ExampleMother.primitives(id, 3),
      ],
    });
    repository.search.mockResolvedValue(flashcard);

    await useCase.execute(
      RequestAiExamplesCompleterMother.random({
        flashcardId: flashcard.id.value,
      }),
    );

    expect(aiExampleGenerator.generate).not.toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalled();
    const events: DomainEvent[] = publisher.publish.mock.calls[0][0];
    expect(events[0]).toBeInstanceOf(FlashcardExamplesCompletedEvent);
  });

  it('should do nothing when flashcard does not exist', async () => {
    repository.search.mockResolvedValue(null);

    await useCase.execute(RequestAiExamplesCompleterMother.random());

    expect(aiExampleGenerator.generate).not.toHaveBeenCalled();
    expect(repository.save).not.toHaveBeenCalled();
    expect(publisher.publish).not.toHaveBeenCalled();
  });
});
