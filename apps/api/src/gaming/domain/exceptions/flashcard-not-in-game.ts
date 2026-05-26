import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class FlashcardNotInGame extends DomainException {
  constructor(flashcardId: string, gameId: string) {
    super(`Flashcard <${flashcardId}> does not belong to game <${gameId}>`);
  }
}
