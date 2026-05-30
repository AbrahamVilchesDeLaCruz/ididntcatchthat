import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class GameStatusInvalid extends DomainException {
  constructor(value: string) {
    super(`GameStatus value <${value}> is invalid`);
  }
}
