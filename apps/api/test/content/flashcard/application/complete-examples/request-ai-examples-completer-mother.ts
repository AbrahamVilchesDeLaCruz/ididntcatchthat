import { type RequestAiExamplesCompleter } from '@/content/flashcard/application/complete-examples/ai-examples-completer';
import { UuidMother } from '@test/shared/domain/uuid-mother';

export type { RequestAiExamplesCompleter } from '@/content/flashcard/application/complete-examples/ai-examples-completer';

export class RequestAiExamplesCompleterMother {
  static random(
    overrides?: Partial<RequestAiExamplesCompleter>,
  ): RequestAiExamplesCompleter {
    return {
      flashcardId: overrides?.flashcardId ?? UuidMother.random(),
    };
  }
}
