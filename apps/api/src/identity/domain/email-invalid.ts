import { DomainException } from '@/shared/domain/domain-exception';

export class EmailInvalid extends DomainException {
  constructor(value: string) {
    super(`<${value}> is not a valid email`);
  }
}
