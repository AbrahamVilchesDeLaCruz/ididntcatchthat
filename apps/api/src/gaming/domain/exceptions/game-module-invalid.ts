import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class GameModuleInvalid extends DomainException {
  constructor(value: string) {
    super(`GameModule value <${value}> is invalid`);
  }
}
