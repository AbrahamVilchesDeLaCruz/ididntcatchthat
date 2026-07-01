import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type FlashcardAudioGenerator } from '@/content/flashcard/application/generate-audio/flashcard-audio-generator';
import { GenerateFlashcardAudioOnFlashcardExpressionUpdated } from '@/content/flashcard/application/generate-audio/generate-flashcard-audio-on-flashcard-expression-updated';
import { FlashcardExpressionUpdatedEvent } from '@/content/flashcard/domain/events/flashcard-expression-updated.event';
import { FlashcardMother } from '@test/content/flashcard/domain/flashcard-mother';

describe('content/flashcard/application/generate-audio GenerateFlashcardAudioOnFlashcardExpressionUpdated', () => {
  const consumer = mock<DomainEventConsumer>();
  const generator = mock<FlashcardAudioGenerator>();
  let subscriber: GenerateFlashcardAudioOnFlashcardExpressionUpdated;

  beforeEach(() => {
    generator.execute.mockReset();
    generator.execute.mockResolvedValue(undefined);
    subscriber = new GenerateFlashcardAudioOnFlashcardExpressionUpdated(
      consumer,
      generator,
    );
  });

  it('should delegate to FlashcardAudioGenerator with the aggregate id', async () => {
    const flashcard = FlashcardMother.random();
    const event = new FlashcardExpressionUpdatedEvent(flashcard.id.value, {
      flashcardId: flashcard.id.value,
      expression: flashcard.expression.value,
    });

    await subscriber.on(event);

    expect(generator.execute).toHaveBeenCalledWith({
      flashcardId: flashcard.id.value,
    });
  });
});
