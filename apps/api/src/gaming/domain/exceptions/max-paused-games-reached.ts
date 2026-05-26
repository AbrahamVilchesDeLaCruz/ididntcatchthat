import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class MaxPausedGamesReached extends DomainException {
  constructor(readonly pausedGameIds: string[]) {
    super(
      `Maximum paused games reached. Paused games: ${pausedGameIds.join(', ')}`,
    );
  }
}
