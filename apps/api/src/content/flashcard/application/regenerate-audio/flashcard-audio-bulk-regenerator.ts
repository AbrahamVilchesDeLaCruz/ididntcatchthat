import { Inject, Injectable } from '@nestjs/common';
import {
  Criteria,
  FilterOperator,
  type Filter,
} from '@/shared/domain/criteria';
import {
  type FlashcardRepository,
  FLASHCARD_REPOSITORY,
} from '@/content/flashcard/domain/flashcard.repository';
import { FlashcardAudioGenerator } from '@/content/flashcard/application/generate-audio/flashcard-audio-generator';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';
import { type RequestFlashcardAudioBulkRegenerator } from './request-flashcard-audio-bulk-regenerator';
import { type ResponseFlashcardAudioBulkRegenerator } from './response-flashcard-audio-bulk-regenerator';

export type { RequestFlashcardAudioBulkRegenerator } from './request-flashcard-audio-bulk-regenerator';
export type { ResponseFlashcardAudioBulkRegenerator } from './response-flashcard-audio-bulk-regenerator';

@Injectable()
export class FlashcardAudioBulkRegenerator {
  constructor(
    @Inject(FLASHCARD_REPOSITORY)
    private readonly repository: FlashcardRepository,
    @Inject(FlashcardAudioGenerator)
    private readonly generator: FlashcardAudioGenerator,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
  ) {}

  async execute(
    request: RequestFlashcardAudioBulkRegenerator,
  ): Promise<ResponseFlashcardAudioBulkRegenerator> {
    const filters: Filter[] = [
      {
        field: 'audioStatus',
        operator: FilterOperator.EQ,
        value: request.audioStatus,
      },
    ];

    if (request.category) {
      filters.push({
        field: 'category',
        operator: FilterOperator.EQ,
        value: request.category,
      });
    }

    if (request.subcategory) {
      filters.push({
        field: 'subcategory',
        operator: FilterOperator.EQ,
        value: request.subcategory,
      });
    }

    const flashcards = await this.repository.match(new Criteria(filters));

    let triggered = 0;
    for (const flashcard of flashcards) {
      if (!flashcard.audioStatus.canRegenerateAudio()) continue;
      void this.generator.execute({ flashcardId: flashcard.id.value });
      triggered += 1;
    }

    this.logger.info('Flashcard audio bulk regeneration started', {
      audioStatus: request.audioStatus,
      category: request.category ?? null,
      subcategory: request.subcategory ?? null,
      matched: flashcards.length,
      triggered,
    });

    return { triggered };
  }
}
