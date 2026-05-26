import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class GameNotFinished extends DomainException {
  constructor(gameId: string, pendingCount: number) {
    super(`Game <${gameId}> has ${pendingCount} pending flashcard(s)`);
  }
}
