import {
  DomainEvent,
  type DomainEventAttributes,
} from '@/shared/domain/domain-event';

export interface AttemptRecordedAttributes extends DomainEventAttributes {
  gameId: string;
  userId: string | null;
  flashcardId: string;
  correct: boolean;
  mode: string;
  answeredAt: string;
}

export class AttemptRecordedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    readonly attrs: AttemptRecordedAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(aggregateId, attrs, eventId, occurredOn);
  }

  eventName(): string {
    return 'ididntcatchthat.gaming.attempts.attempt.recorded';
  }
}
