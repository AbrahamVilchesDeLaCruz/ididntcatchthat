import {
  DomainEvent,
  type DomainEventAttributes,
} from '@/shared/domain/domain-event';

export type FlashcardExpressionUpdatedAttributes = {
  flashcardId: string;
  expression: string;
};

export class FlashcardExpressionUpdatedEvent extends DomainEvent {
  static readonly EVENT_NAME =
    'ididntcatchthat.content.flashcard.expression_updated';

  constructor(
    aggregateId: string,
    attributes: FlashcardExpressionUpdatedAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(aggregateId, attributes, eventId, occurredOn);
  }

  eventName(): string {
    return FlashcardExpressionUpdatedEvent.EVENT_NAME;
  }

  static fromPrimitives(
    aggregateId: string,
    eventId: string,
    occurredOn: Date,
    attributes: DomainEventAttributes,
  ): FlashcardExpressionUpdatedEvent {
    return new FlashcardExpressionUpdatedEvent(
      aggregateId,
      attributes as FlashcardExpressionUpdatedAttributes,
      eventId,
      occurredOn,
    );
  }
}
