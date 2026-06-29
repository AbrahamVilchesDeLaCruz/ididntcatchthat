import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class AttemptRequiresGameMode extends DomainException {
  constructor(gameId: string) {
    super(`Recording attempts is only allowed for game sessions (${gameId})`);
  }
}
