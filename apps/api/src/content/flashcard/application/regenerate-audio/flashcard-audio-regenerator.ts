import { Inject, Injectable } from '@nestjs/common';
import { FlashcardId } from '@/shared/domain/flashcard-id';
import { AudioStatusInvalid } from '@/content/flashcard/domain/exceptions/audio-status-invalid';
import { FlashcardNotFound } from '@/content/flashcard/domain/exceptions/flashcard-not-found';
import {
  type FlashcardRepository,
  FLASHCARD_REPOSITORY,
} from '@/content/flashcard/domain/flashcard.repository';
import { FlashcardAudioGenerator } from '@/content/flashcard/application/generate-audio/flashcard-audio-generator';
import { type RequestFlashcardAudioRegenerator } from './request-flashcard-audio-regenerator';

export type { RequestFlashcardAudioRegenerator } from './request-flashcard-audio-regenerator';

@Injectable()
export class FlashcardAudioRegenerator {
  constructor(
    @Inject(FLASHCARD_REPOSITORY)
    private readonly repository: FlashcardRepository,
    @Inject(FlashcardAudioGenerator)
    private readonly generator: FlashcardAudioGenerator,
  ) {}

  async execute(request: RequestFlashcardAudioRegenerator): Promise<void> {
    const flashcard = await this.repository.search(
      new FlashcardId(request.flashcardId),
    );
    if (!flashcard) throw new FlashcardNotFound();

    if (!flashcard.audioStatus.isFailed()) {
      throw new AudioStatusInvalid();
    }

    await this.generator.execute({ flashcardId: request.flashcardId });
  }
}
