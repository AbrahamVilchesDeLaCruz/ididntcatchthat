import {
  DomainEvent,
  type DomainEventAttributes,
} from '@/shared/domain/domain-event';

export interface FlashcardViewedAttributes extends DomainEventAttributes {
  gameId: string;
  userId: string | null;
  flashcardId: string;
  viewedAt: string;
}

export class FlashcardViewedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    readonly attrs: FlashcardViewedAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(aggregateId, attrs, eventId, occurredOn);
  }

  eventName(): string {
    return 'ididntcatchthat.gaming.views.flashcard.viewed';
  }
}
