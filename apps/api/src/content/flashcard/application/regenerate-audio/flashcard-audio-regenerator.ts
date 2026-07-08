import { Inject, Injectable } from '@nestjs/common';
import { FlashcardId } from '@/shared/domain/flashcard-id';
import { AudioStatusInvalid } from '@/content/flashcard/domain/exceptions/audio-status-invalid';
import { FlashcardNotFound } from '@/content/flashcard/domain/exceptions/flashcard-not-found';
import {
  type FlashcardRepository,
  FLASHCARD_REPOSITORY,
} from '@/content/flashcard/domain/flashcard.repository';
import {
  type DomainEventPublisher,
  DOMAIN_EVENT_PUBLISHER,
} from '@/shared/domain/domain-event-publisher';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';
import { type RequestFlashcardAudioRegenerator } from './request-flashcard-audio-regenerator';

export type { RequestFlashcardAudioRegenerator } from './request-flashcard-audio-regenerator';

@Injectable()
export class FlashcardAudioRegenerator {
  constructor(
    @Inject(FLASHCARD_REPOSITORY)
    private readonly repository: FlashcardRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
  ) {}

  async execute(request: RequestFlashcardAudioRegenerator): Promise<void> {
    const flashcard = await this.repository.search(
      new FlashcardId(request.flashcardId),
    );
    if (!flashcard) throw new FlashcardNotFound();

    if (!flashcard.audioStatus.canRegenerateAudio()) {
      throw new AudioStatusInvalid();
    }

    flashcard.markAudioRegenerationRequested();
    await this.repository.save(flashcard);
    await this.publisher.publish(flashcard.pullDomainEvents());

    this.logger.info('Flashcard audio regeneration requested', {
      flashcardId: request.flashcardId,
    });
  }
}
