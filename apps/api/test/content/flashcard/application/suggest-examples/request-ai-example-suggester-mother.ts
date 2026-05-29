import { type RequestAiExampleSuggester } from '@/content/flashcard/application/suggest-examples/ai-example-suggester';
import { StringMother } from '@test/shared/domain/string-mother';

export type { RequestAiExampleSuggester } from '@/content/flashcard/application/suggest-examples/ai-example-suggester';

export class RequestAiExampleSuggesterMother {
  static random(
    overrides?: Partial<RequestAiExampleSuggester>,
  ): RequestAiExampleSuggester {
    return {
      expression: overrides?.expression ?? StringMother.random(),
      category: overrides?.category ?? StringMother.random(),
    };
  }
}
