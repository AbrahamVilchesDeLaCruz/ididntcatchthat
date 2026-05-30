import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class GameIdInvalid extends DomainException {
  constructor(value: string) {
    super(`GameId value <${value}> is not a valid UUID`);
  }
}
