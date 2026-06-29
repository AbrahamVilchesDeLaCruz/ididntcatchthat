import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class ViewRequiresStudyMode extends DomainException {
  constructor(gameId: string) {
    super(`Recording views is only allowed for study sessions (${gameId})`);
  }
}
