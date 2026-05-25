import { type FlashcardUpdateFields } from '@/content/flashcard/domain/flashcard';
import { FlashcardIdMother } from '@test/content/flashcard/domain/flashcard-id-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';

export type RequestFlashcardUpdater = {
  id: string;
  requesterId: string;
  requesterRole: string;
  fields: FlashcardUpdateFields;
};

export class RequestFlashcardUpdaterMother {
  static random(
    overrides?: Partial<RequestFlashcardUpdater>,
  ): RequestFlashcardUpdater {
    return {
      id: overrides?.id ?? FlashcardIdMother.random().value,
      requesterId: overrides?.requesterId ?? UuidMother.random(),
      requesterRole: overrides?.requesterRole ?? 'teacher',
      fields: overrides?.fields ?? {},
    };
  }
}
