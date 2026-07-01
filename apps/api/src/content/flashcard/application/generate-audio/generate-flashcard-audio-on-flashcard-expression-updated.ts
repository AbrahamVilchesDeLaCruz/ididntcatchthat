import { Inject, Injectable } from '@nestjs/common';
import { Subscriber } from '@/shared/application/subscriber';
import {
  type DomainEventConsumer,
  DOMAIN_EVENT_CONSUMER,
} from '@/shared/application/domain-event-consumer';
import { type DomainEvent } from '@/shared/domain/domain-event';
import { FlashcardExpressionUpdatedEvent } from '@/content/flashcard/domain/events/flashcard-expression-updated.event';
import { FlashcardAudioGenerator } from './flashcard-audio-generator';

@Injectable()
export class GenerateFlashcardAudioOnFlashcardExpressionUpdated extends Subscriber {
  readonly queueName =
    'generate_flashcard_audio_on_flashcard_expression_updated';
  readonly eventName = FlashcardExpressionUpdatedEvent.EVENT_NAME;
  readonly exchangeName = FlashcardExpressionUpdatedEvent.EVENT_NAME;
  readonly domainEvent = FlashcardExpressionUpdatedEvent;

  constructor(
    @Inject(DOMAIN_EVENT_CONSUMER) consumer: DomainEventConsumer,
    @Inject(FlashcardAudioGenerator)
    private readonly generator: FlashcardAudioGenerator,
  ) {
    super(consumer);
  }

  async on(event: DomainEvent): Promise<void> {
    await this.generator.execute({ flashcardId: event.aggregateId });
  }
}
