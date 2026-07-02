import {
  DomainEvent,
  type DomainEventAttributes,
} from '@/shared/domain/domain-event';

export interface GameCompletedAttributes extends DomainEventAttributes {
  gameId: string;
  userId: string | null;
  mode: string;
  module: string | null;
  subcategory: string | null;
  source: string;
  cardCount: string;
  correctCount: number;
  totalCount: number;
  startedAt: string;
  finishedAt: string;
}

export class GameCompletedEvent extends DomainEvent {
  static readonly EVENT_NAME = 'ididntcatchthat.gaming.games.game.completed';

  constructor(
    aggregateId: string,
    readonly attrs: GameCompletedAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(aggregateId, attrs, eventId, occurredOn);
  }

  eventName(): string {
    return GameCompletedEvent.EVENT_NAME;
  }
}
