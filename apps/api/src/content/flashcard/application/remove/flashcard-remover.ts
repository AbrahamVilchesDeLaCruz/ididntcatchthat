import { Inject, Injectable } from '@nestjs/common';
import { FlashcardId } from '@/shared/domain/flashcard-id';
import { FlashcardNotFound } from '@/content/flashcard/domain/exceptions/flashcard-not-found';
import {
  type FlashcardRepository,
  FLASHCARD_REPOSITORY,
} from '@/content/flashcard/domain/flashcard.repository';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';
import { type RequestFlashcardRemover } from './request-flashcard-remover';

export type { RequestFlashcardRemover } from './request-flashcard-remover';

@Injectable()
export class FlashcardRemover {
  constructor(
    @Inject(FLASHCARD_REPOSITORY)
    private readonly repository: FlashcardRepository,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
  ) {}

  async execute(request: RequestFlashcardRemover): Promise<void> {
    const { id, requesterId, requesterRole } = request;

    const flashcard = await this.repository.search(new FlashcardId(id));
    if (!flashcard) throw new FlashcardNotFound();

    flashcard.assertCanBeModifiedBy(requesterId, requesterRole);
    flashcard.softDelete();

    await this.repository.save(flashcard);

    this.logger.info('Flashcard soft deleted', {
      flashcardId: id,
      requesterId,
    });
  }
}
