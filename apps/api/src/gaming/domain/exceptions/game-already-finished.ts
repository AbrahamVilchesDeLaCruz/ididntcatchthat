import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class GameAlreadyFinished extends DomainException {
  constructor(gameId: string) {
    super(`Game <${gameId}> is already finished`);
  }
}
