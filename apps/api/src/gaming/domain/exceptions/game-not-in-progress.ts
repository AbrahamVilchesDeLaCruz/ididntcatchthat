import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class GameNotInProgress extends DomainException {
  constructor(gameId: string) {
    super(`Game <${gameId}> is not in progress`);
  }
}
