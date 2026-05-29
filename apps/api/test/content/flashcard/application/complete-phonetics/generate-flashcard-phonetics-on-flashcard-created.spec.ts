import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type AiPhoneticsCompleter } from '@/content/flashcard/application/complete-phonetics/ai-phonetics-completer';
import { GenerateFlashcardPhoneticsOnFlashcardCreated } from '@/content/flashcard/application/complete-phonetics/generate-flashcard-phonetics-on-flashcard-created';
import { FlashcardCreatedEvent } from '@/content/flashcard/domain/events/flashcard-created.event';
import { FlashcardMother } from '@test/content/flashcard/domain/flashcard-mother';

describe('content/flashcard/application/complete-phonetics GenerateFlashcardPhoneticsOnFlashcardCreated', () => {
  const consumer = mock<DomainEventConsumer>();
  const completer = mock<AiPhoneticsCompleter>();
  let subscriber: GenerateFlashcardPhoneticsOnFlashcardCreated;

  beforeEach(() => {
    completer.execute.mockReset();
    completer.execute.mockResolvedValue(undefined);
    subscriber = new GenerateFlashcardPhoneticsOnFlashcardCreated(
      consumer,
      completer,
    );
  });

  it('should delegate to AiPhoneticsCompleter with the aggregate id', async () => {
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
