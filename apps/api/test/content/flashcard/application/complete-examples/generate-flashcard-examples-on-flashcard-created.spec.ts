import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type AiExamplesCompleter } from '@/content/flashcard/application/complete-examples/ai-examples-completer';
import { GenerateFlashcardExamplesOnFlashcardCreated } from '@/content/flashcard/application/complete-examples/generate-flashcard-examples-on-flashcard-created';
import { FlashcardCreatedEvent } from '@/content/flashcard/domain/events/flashcard-created.event';
import { FlashcardMother } from '@test/content/flashcard/domain/flashcard-mother';

describe('content/flashcard/application/complete-examples GenerateFlashcardExamplesOnFlashcardCreated', () => {
  const consumer = mock<DomainEventConsumer>();
  const completer = mock<AiExamplesCompleter>();
  let subscriber: GenerateFlashcardExamplesOnFlashcardCreated;

  beforeEach(() => {
    completer.execute.mockReset();
    completer.execute.mockResolvedValue(undefined);
    subscriber = new GenerateFlashcardExamplesOnFlashcardCreated(
      consumer,
      completer,
    );
  });

  it('should delegate to AiExamplesCompleter with the aggregate id', async () => {
    const flashcard = FlashcardMother.random();
    const event = new FlashcardCreatedEvent(
      flashcard.id.value,
      flashcard.toPrimitives(),
    );

    await subscriber.on(event);

    expect(completer.execute).toHaveBeenCalledWith({
      flashcardId: flashcard.id.value,
    });
  });

  it('should subscribe to FlashcardCreatedEvent', () => {
    expect(subscriber.eventName).toBe(FlashcardCreatedEvent.EVENT_NAME);
  });
});
