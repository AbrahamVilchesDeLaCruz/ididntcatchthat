import {
  DomainEvent,
  type DomainEventAttributes,
} from '@/shared/domain/domain-event';

export type FlashcardPhoneticsCompletedAttributes = {
  flashcardId: string;
  ipaNotation: string;
  nativeSpeech: string;
};

export class FlashcardPhoneticsCompletedEvent extends DomainEvent {
  static readonly EVENT_NAME =
    'ididntcatchthat.content.flashcard.phonetics_completed';

  constructor(
    aggregateId: string,
    attributes: FlashcardPhoneticsCompletedAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(aggregateId, attributes, eventId, occurredOn);
  }

  eventName(): string {
    return FlashcardPhoneticsCompletedEvent.EVENT_NAME;
  }

  static fromPrimitives(
    aggregateId: string,
    eventId: string,
    occurredOn: Date,
    attributes: DomainEventAttributes,
  ): FlashcardPhoneticsCompletedEvent {
    return new FlashcardPhoneticsCompletedEvent(
      aggregateId,
      attributes as FlashcardPhoneticsCompletedAttributes,
      eventId,
      occurredOn,
    );
  }
}
