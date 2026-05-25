import { Inject, Injectable } from '@nestjs/common';
import { Handler } from '@/shared/application/handler';
import {
  type DomainEventConsumer,
  DOMAIN_EVENT_CONSUMER,
} from '@/shared/application/domain-event-consumer';
import { type DomainEvent } from '@/shared/domain/domain-event';
import { FlashcardExamplesCompletedEvent } from '@/content/flashcard/domain/events/flashcard-examples-completed.event';
import { FlashcardAudioGenerator } from '../generate-audio/flashcard-audio-generator';

@Injectable()
export class GenerateFlashcardAudioOnFlashcardExamplesCompleted extends Handler {
  readonly queueName =
    'generate_flashcard_audio_on_flashcard_examples_completed';
  readonly eventName = FlashcardExamplesCompletedEvent.EVENT_NAME;
  readonly exchangeName = FlashcardExamplesCompletedEvent.EVENT_NAME;
  readonly domainEvent = FlashcardExamplesCompletedEvent;

  constructor(
    @Inject(DOMAIN_EVENT_CONSUMER) consumer: DomainEventConsumer,
    private readonly generator: FlashcardAudioGenerator,
  ) {
    super(consumer);
  }

  async handle(event: DomainEvent): Promise<void> {
    await this.generator.execute({ flashcardId: event.aggregateId });
  }
}
