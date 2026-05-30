import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class GameModeInvalid extends DomainException {
  constructor(value: string) {
    super(`GameMode value <${value}> is invalid`);
  }
}
