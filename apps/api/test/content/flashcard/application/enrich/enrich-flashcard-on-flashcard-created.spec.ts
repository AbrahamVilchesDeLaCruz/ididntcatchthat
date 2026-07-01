import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type AiExamplesCompleter } from '@/content/flashcard/application/complete-examples/ai-examples-completer';
import { type AiPhoneticsCompleter } from '@/content/flashcard/application/complete-phonetics/ai-phonetics-completer';
import { EnrichFlashcardOnFlashcardCreated } from '@/content/flashcard/application/enrich/enrich-flashcard-on-flashcard-created';
import { FlashcardCreatedEvent } from '@/content/flashcard/domain/events/flashcard-created.event';
import { FlashcardMother } from '@test/content/flashcard/domain/flashcard-mother';

describe('content/flashcard/application/enrich EnrichFlashcardOnFlashcardCreated', () => {
  const consumer = mock<DomainEventConsumer>();
  const examplesCompleter = mock<AiExamplesCompleter>();
  const phoneticsCompleter = mock<AiPhoneticsCompleter>();
  let subscriber: EnrichFlashcardOnFlashcardCreated;

  beforeEach(() => {
    examplesCompleter.execute.mockReset();
    phoneticsCompleter.execute.mockReset();
    examplesCompleter.execute.mockResolvedValue(undefined);
    phoneticsCompleter.execute.mockResolvedValue(undefined);
    subscriber = new EnrichFlashcardOnFlashcardCreated(
      consumer,
      examplesCompleter,
      phoneticsCompleter,
    );
  });

  it('should enrich examples and phonetics sequentially', async () => {
    const flashcard = FlashcardMother.random();
    const event = new FlashcardCreatedEvent(
      flashcard.id.value,
      flashcard.toPrimitives(),
    );
    const callOrder: string[] = [];
    examplesCompleter.execute.mockImplementation(() => {
      callOrder.push('examples');
      return Promise.resolve();
    });
    phoneticsCompleter.execute.mockImplementation(() => {
      callOrder.push('phonetics');
      return Promise.resolve();
    });

    await subscriber.on(event);

    expect(examplesCompleter.execute).toHaveBeenCalledWith({
      flashcardId: flashcard.id.value,
    });
    expect(phoneticsCompleter.execute).toHaveBeenCalledWith({
      flashcardId: flashcard.id.value,
    });
    expect(callOrder).toEqual(['examples', 'phonetics']);
  });

  it('should subscribe to FlashcardCreatedEvent', () => {
    expect(subscriber.eventName).toBe(FlashcardCreatedEvent.EVENT_NAME);
  });
});
