import { type RequestWeakestFlashcardSearcher } from '@/progress/application/search/weakest-flashcard-searcher';
import { ProgressUserIdMother } from '@test/progress/domain/progress-user-id-mother';

export class RequestWeakestFlashcardSearcherMother {
  static random(): RequestWeakestFlashcardSearcher {
    return { userId: ProgressUserIdMother.random().value };
  }

  static withLimit(limit: number): RequestWeakestFlashcardSearcher {
    return { userId: ProgressUserIdMother.random().value, limit };
  }
}
