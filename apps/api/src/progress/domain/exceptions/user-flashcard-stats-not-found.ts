import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class UserFlashcardStatsNotFound extends DomainException {
  constructor(userId: string, flashcardId: string) {
    super(
      `UserFlashcardStats not found for userId <${userId}> and flashcardId <${flashcardId}>`,
    );
  }
}
