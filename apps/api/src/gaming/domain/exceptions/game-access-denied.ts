import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class GameAccessDenied extends DomainException {
  constructor(gameId: string) {
    super(`Access denied to game <${gameId}>`);
  }
}
