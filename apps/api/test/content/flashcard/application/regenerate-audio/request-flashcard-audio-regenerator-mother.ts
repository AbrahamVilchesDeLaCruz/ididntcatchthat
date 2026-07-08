import { type RequestFlashcardAudioRegenerator } from '@/content/flashcard/application/regenerate-audio/flashcard-audio-regenerator';
import { FlashcardIdMother } from '@test/content/flashcard/domain/flashcard-id-mother';

export class RequestFlashcardAudioRegeneratorMother {
  static random(
    overrides?: Partial<RequestFlashcardAudioRegenerator>,
  ): RequestFlashcardAudioRegenerator {
    return {
      flashcardId: overrides?.flashcardId ?? FlashcardIdMother.random().value,
    };
  }
}
