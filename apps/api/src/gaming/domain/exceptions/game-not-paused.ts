import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class GameNotPaused extends DomainException {
  constructor(gameId: string) {
    super(`Game <${gameId}> is not paused`);
  }
}
