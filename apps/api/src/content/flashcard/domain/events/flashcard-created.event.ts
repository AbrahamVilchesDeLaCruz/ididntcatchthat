import {
  DomainEvent,
  type DomainEventAttributes,
} from '@/shared/domain/domain-event';
import { type FlashcardPrimitives } from '../flashcard';

export class FlashcardCreatedEvent extends DomainEvent {
  static readonly EVENT_NAME = 'ididntcatchthat.content.flashcard.created';

  constructor(
    aggregateId: string,
    attributes: FlashcardPrimitives,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(aggregateId, attributes, eventId, occurredOn);
  }

  eventName(): string {
    return FlashcardCreatedEvent.EVENT_NAME;
  }

  static fromPrimitives(
    aggregateId: string,
    eventId: string,
    occurredOn: Date,
    attributes: DomainEventAttributes,
  ): FlashcardCreatedEvent {
    return new FlashcardCreatedEvent(
      aggregateId,
      attributes as FlashcardPrimitives,
      eventId,
      occurredOn,
    );
  }
}
