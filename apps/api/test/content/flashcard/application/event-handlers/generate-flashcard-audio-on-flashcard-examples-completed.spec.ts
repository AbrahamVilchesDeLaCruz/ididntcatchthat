import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type FlashcardAudioGenerator } from '@/content/flashcard/application/generate-audio/flashcard-audio-generator';
import { GenerateFlashcardAudioOnFlashcardExamplesCompleted } from '@/content/flashcard/application/event-handlers/generate-flashcard-audio-on-flashcard-examples-completed';
import { FlashcardExamplesCompletedEvent } from '@/content/flashcard/domain/events/flashcard-examples-completed.event';
import { FlashcardMother } from '@test/content/flashcard/domain/flashcard-mother';

describe('content/flashcard/application/event-handlers GenerateFlashcardAudioOnFlashcardExamplesCompleted', () => {
  const consumer = mock<DomainEventConsumer>();
  const generator = mock<FlashcardAudioGenerator>();
  let handler: GenerateFlashcardAudioOnFlashcardExamplesCompleted;

  beforeEach(() => {
    generator.execute.mockReset();
    generator.execute.mockResolvedValue(undefined);
    handler = new GenerateFlashcardAudioOnFlashcardExamplesCompleted(
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

    await handler.handle(event);

    expect(generator.execute).toHaveBeenCalledWith({
      flashcardId: flashcard.id.value,
    });
  });

  it('should subscribe to FlashcardExamplesCompletedEvent', () => {
    expect(handler.eventName).toBe(FlashcardExamplesCompletedEvent.EVENT_NAME);
  });
});
