import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class CategoryInvalid extends DomainException {
  constructor() {
    super(`Invalid category`);
  }
}
