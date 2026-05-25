import { type RequestFlashcardCreator } from '@/content/flashcard/application/create/flashcard-creator';
import { RequestFlashcardCreatorMother } from '@test/content/flashcard/application/create/request-flashcard-creator-mother';

export type RequestFlashcardBulkCreator = {
  flashcards: RequestFlashcardCreator[];
};

export class RequestFlashcardBulkCreatorMother {
  static random(count = 2): RequestFlashcardBulkCreator {
    return {
      flashcards: Array.from({ length: count }, () =>
        RequestFlashcardCreatorMother.random(),
      ),
    };
  }
}
