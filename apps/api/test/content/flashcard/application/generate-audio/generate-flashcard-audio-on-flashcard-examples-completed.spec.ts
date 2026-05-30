import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type FlashcardAudioGenerator } from '@/content/flashcard/application/generate-audio/flashcard-audio-generator';
import { GenerateFlashcardAudioOnFlashcardExamplesCompleted } from '@/content/flashcard/application/generate-audio/generate-flashcard-audio-on-flashcard-examples-completed';
import { FlashcardExamplesCompletedEvent } from '@/content/flashcard/domain/events/flashcard-examples-completed.event';
import { FlashcardMother } from '@test/content/flashcard/domain/flashcard-mother';

describe('content/flashcard/application/generate-audio GenerateFlashcardAudioOnFlashcardExamplesCompleted', () => {
  const consumer = mock<DomainEventConsumer>();
  const generator = mock<FlashcardAudioGenerator>();
  let subscriber: GenerateFlashcardAudioOnFlashcardExamplesCompleted;

  beforeEach(() => {
    generator.execute.mockReset();
    generator.execute.mockResolvedValue(undefined);
    subscriber = new GenerateFlashcardAudioOnFlashcardExamplesCompleted(
      consumer,
      generator,
    );
  });

  it('should delegate to FlashcardAudioGenerator with the aggregate id', async () => {
    const flashcard = FlashcardMother.random();
    const event = new FlashcardExamplesCompletedEvent(flashcard.id.value, {
      flashcardId: flashcard.id.value,
      examples: flashcard.examples.map((e) => e.toPrimitives()),
    });

    await subscriber.on(event);

    expect(generator.execute).toHaveBeenCalledWith({
      flashcardId: flashcard.id.value,
    });
  });

  it('should subscribe to FlashcardExamplesCompletedEvent', () => {
    expect(subscriber.eventName).toBe(
      FlashcardExamplesCompletedEvent.EVENT_NAME,
    );
  });
});
