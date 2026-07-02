import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type FlashcardAudioGenerator } from '@/content/flashcard/application/generate-audio/flashcard-audio-generator';
import { GenerateFlashcardAudioOnFlashcardExamplesUpdated } from '@/content/flashcard/application/generate-audio/generate-flashcard-audio-on-flashcard-examples-updated';
import { FlashcardExamplesUpdatedEvent } from '@/content/flashcard/domain/events/flashcard-examples-updated.event';
import { FlashcardMother } from '@test/content/flashcard/domain/flashcard-mother';

describe('content/flashcard/application/generate-audio GenerateFlashcardAudioOnFlashcardExamplesUpdated', () => {
  const consumer = mock<DomainEventConsumer>();
  const generator = mock<FlashcardAudioGenerator>();
  let subscriber: GenerateFlashcardAudioOnFlashcardExamplesUpdated;

  beforeEach(() => {
    generator.execute.mockReset();
    generator.execute.mockResolvedValue(undefined);
    subscriber = new GenerateFlashcardAudioOnFlashcardExamplesUpdated(
      consumer,
      generator,
    );
  });

  it('should delegate to FlashcardAudioGenerator with the aggregate id', async () => {
    const flashcard = FlashcardMother.random();
    const event = new FlashcardExamplesUpdatedEvent(flashcard.id.value, {
      flashcardId: flashcard.id.value,
      examples: flashcard.examples.map((e) => e.toPrimitives()),
    });

    await subscriber.on(event);

    expect(generator.execute).toHaveBeenCalledWith({
      flashcardId: flashcard.id.value,
    });
  });
});
