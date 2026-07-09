import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type FlashcardAudioGenerator } from '@/content/flashcard/application/generate-audio/flashcard-audio-generator';
import { GenerateFlashcardAudioOnFlashcardAudioRegenerationRequested } from '@/content/flashcard/application/generate-audio/generate-flashcard-audio-on-flashcard-audio-regeneration-requested';
import { FlashcardAudioRegenerationRequestedEvent } from '@/content/flashcard/domain/events/flashcard-audio-regeneration-requested.event';
import { FlashcardMother } from '@test/content/flashcard/domain/flashcard-mother';

describe('content/flashcard/application/generate-audio GenerateFlashcardAudioOnFlashcardAudioRegenerationRequested', () => {
  const consumer = mock<DomainEventConsumer>();
  const generator = mock<FlashcardAudioGenerator>();
  let subscriber: GenerateFlashcardAudioOnFlashcardAudioRegenerationRequested;

  beforeEach(() => {
    generator.execute.mockReset();
    generator.execute.mockResolvedValue(undefined);
    subscriber =
      new GenerateFlashcardAudioOnFlashcardAudioRegenerationRequested(
        consumer,
        generator,
      );
  });

  it('should delegate to FlashcardAudioGenerator with the aggregate id', async () => {
    const flashcard = FlashcardMother.random();
    const event = new FlashcardAudioRegenerationRequestedEvent(
      flashcard.id.value,
      { flashcardId: flashcard.id.value },
    );

    await subscriber.on(event);

    expect(generator.execute).toHaveBeenCalledWith({
      flashcardId: flashcard.id.value,
    });
  });
});
