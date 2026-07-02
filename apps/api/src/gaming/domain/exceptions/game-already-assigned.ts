import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class GameAlreadyAssigned extends DomainException {
  constructor(gameId: string) {
    super(`Game <${gameId}> is already assigned to a user`);
  }
}
