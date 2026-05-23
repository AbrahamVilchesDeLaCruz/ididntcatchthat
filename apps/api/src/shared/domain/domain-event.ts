export type DomainEventAttributes = Record<string, unknown>;

export abstract class DomainEvent {
  readonly eventId: string;
  readonly occurredOn: Date;

  constructor(
    readonly aggregateId: string,
    readonly attributes: DomainEventAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    this.eventId = eventId ?? crypto.randomUUID();
    this.occurredOn = occurredOn ?? new Date();
  }

  abstract eventName(): string;
}
