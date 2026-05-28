import {
  DomainEvent,
  type DomainEventAttributes,
} from '@/shared/domain/domain-event';
import { type ExamplePrimitives } from '../example';

export type FlashcardExamplesCompletedAttributes = {
  flashcardId: string;
  examples: ExamplePrimitives[];
};

export class FlashcardExamplesCompletedEvent extends DomainEvent {
  static readonly EVENT_NAME =
    'ididntcatchthat.content.flashcard.examples_completed';

  constructor(
    aggregateId: string,
    attributes: FlashcardExamplesCompletedAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(aggregateId, attributes, eventId, occurredOn);
  }

  eventName(): string {
    return FlashcardExamplesCompletedEvent.EVENT_NAME;
  }

  static fromPrimitives(
    aggregateId: string,
    eventId: string,
    occurredOn: Date,
    attributes: DomainEventAttributes,
  ): FlashcardExamplesCompletedEvent {
    return new FlashcardExamplesCompletedEvent(
      aggregateId,
      attributes as FlashcardExamplesCompletedAttributes,
      eventId,
      occurredOn,
    );
  }
}
