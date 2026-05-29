import {
  type RequestFlashcardBulkCreator,
  type RequestFlashcardBulkCreatorItem,
} from '@/content/flashcard/application/bulk-create/flashcard-bulk-creator';
import { RequestFlashcardCreatorMother } from '@test/content/flashcard/application/create/request-flashcard-creator-mother';

export type { RequestFlashcardBulkCreator } from '@/content/flashcard/application/bulk-create/flashcard-bulk-creator';

export class RequestFlashcardBulkCreatorMother {
  static random(count = 2): RequestFlashcardBulkCreator {
    return Array.from(
      { length: count },
      (): RequestFlashcardBulkCreatorItem =>
        RequestFlashcardCreatorMother.random(),
    );
  }
}
