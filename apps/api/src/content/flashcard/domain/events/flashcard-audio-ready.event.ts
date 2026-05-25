import {
  DomainEvent,
  type DomainEventAttributes,
} from '@/shared/domain/domain-event';
import { type AudioUrlsPrimitives } from '../audio-urls';

export type FlashcardAudioReadyAttributes = {
  flashcardId: string;
  audioUrls: AudioUrlsPrimitives;
};

export class FlashcardAudioReadyEvent extends DomainEvent {
  static readonly EVENT_NAME = 'ididntcatchthat.content.flashcard.audio_ready';

  constructor(
    aggregateId: string,
    attributes: FlashcardAudioReadyAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(aggregateId, attributes, eventId, occurredOn);
  }

  eventName(): string {
    return FlashcardAudioReadyEvent.EVENT_NAME;
  }

  static fromPrimitives(
    aggregateId: string,
    eventId: string,
    occurredOn: Date,
    attributes: DomainEventAttributes,
  ): FlashcardAudioReadyEvent {
    return new FlashcardAudioReadyEvent(
      aggregateId,
      attributes as FlashcardAudioReadyAttributes,
      eventId,
      occurredOn,
    );
  }
}
