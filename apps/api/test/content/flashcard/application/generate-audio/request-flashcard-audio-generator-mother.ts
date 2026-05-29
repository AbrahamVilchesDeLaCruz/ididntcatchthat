import { type RequestFlashcardAudioGenerator } from '@/content/flashcard/application/generate-audio/flashcard-audio-generator';
import { UuidMother } from '@test/shared/domain/uuid-mother';

export type { RequestFlashcardAudioGenerator } from '@/content/flashcard/application/generate-audio/flashcard-audio-generator';

export class RequestFlashcardAudioGeneratorMother {
  static random(
    overrides?: Partial<RequestFlashcardAudioGenerator>,
  ): RequestFlashcardAudioGenerator {
    return {
      flashcardId: overrides?.flashcardId ?? UuidMother.random(),
    };
  }
}
