export interface ProcessedEventsRepository {
  exists(eventId: string, handler: string): Promise<boolean>;
  save(eventId: string, handler: string): Promise<void>;
}

export const PROCESSED_EVENTS_REPOSITORY = Symbol('ProcessedEventsRepository');
