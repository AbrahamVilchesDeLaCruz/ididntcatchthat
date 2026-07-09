import { type RequestFlashcardRemover } from '@/content/flashcard/application/remove/flashcard-remover';
import { FlashcardIdMother } from '@test/content/flashcard/domain/flashcard-id-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';

export class RequestFlashcardRemoverMother {
  static random(
    overrides?: Partial<RequestFlashcardRemover>,
  ): RequestFlashcardRemover {
    return {
      id: overrides?.id ?? FlashcardIdMother.random().value,
      requesterId: overrides?.requesterId ?? UuidMother.random(),
      requesterRole: overrides?.requesterRole ?? 'admin',
    };
  }
}
