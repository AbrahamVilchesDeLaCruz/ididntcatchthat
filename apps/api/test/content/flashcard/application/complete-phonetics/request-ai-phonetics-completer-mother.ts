import { type RequestAiPhoneticsCompleter } from '@/content/flashcard/application/complete-phonetics/ai-phonetics-completer';
import { UuidMother } from '@test/shared/domain/uuid-mother';

export type { RequestAiPhoneticsCompleter } from '@/content/flashcard/application/complete-phonetics/ai-phonetics-completer';

export class RequestAiPhoneticsCompleterMother {
  static random(
    overrides?: Partial<RequestAiPhoneticsCompleter>,
  ): RequestAiPhoneticsCompleter {
    return {
      flashcardId: overrides?.flashcardId ?? UuidMother.random(),
    };
  }
}
