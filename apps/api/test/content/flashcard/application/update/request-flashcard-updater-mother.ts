import { type RequestFlashcardUpdater } from '@/content/flashcard/application/update/flashcard-updater';
import { FlashcardIdMother } from '@test/content/flashcard/domain/flashcard-id-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';

export type { RequestFlashcardUpdater } from '@/content/flashcard/application/update/flashcard-updater';

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
