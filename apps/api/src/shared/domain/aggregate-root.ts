import { type DomainEvent } from './domain-event';

export abstract class AggregateRoot<Primitives> {
  private domainEvents: DomainEvent[] = [];

  abstract toPrimitives(): Primitives;

  protected record(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents = [];
    return events;
  }
}
