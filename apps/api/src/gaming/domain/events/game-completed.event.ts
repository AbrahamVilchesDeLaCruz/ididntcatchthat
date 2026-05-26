import {
  DomainEvent,
  type DomainEventAttributes,
} from '@/shared/domain/domain-event';

export interface GameCompletedAttributes extends DomainEventAttributes {
  gameId: string;
  userId: string | null;
  mode: string;
  module: string | null;
  cardCount: string;
  startedAt: string;
  finishedAt: string;
}

export class GameCompletedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    readonly attrs: GameCompletedAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(aggregateId, attrs, eventId, occurredOn);
  }

  eventName(): string {
    return 'ididntcatchthat.gaming.games.game.completed';
  }
}
