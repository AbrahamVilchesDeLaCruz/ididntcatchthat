import {
  DomainEvent,
  type DomainEventAttributes,
} from '@/shared/domain/domain-event';
import { type ExamplePrimitives } from '@/content/flashcard/domain/example';

export type FlashcardExamplesUpdatedAttributes = {
  flashcardId: string;
  examples: ExamplePrimitives[];
};

export class FlashcardExamplesUpdatedEvent extends DomainEvent {
  static readonly EVENT_NAME =
    'ididntcatchthat.content.flashcard.examples_updated';

  constructor(
    aggregateId: string,
    attributes: FlashcardExamplesUpdatedAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(aggregateId, attributes, eventId, occurredOn);
  }

  eventName(): string {
    return FlashcardExamplesUpdatedEvent.EVENT_NAME;
  }

  static fromPrimitives(
    aggregateId: string,
    eventId: string,
    occurredOn: Date,
    attributes: DomainEventAttributes,
  ): FlashcardExamplesUpdatedEvent {
    return new FlashcardExamplesUpdatedEvent(
      aggregateId,
      attributes as FlashcardExamplesUpdatedAttributes,
      eventId,
      occurredOn,
    );
  }
}
