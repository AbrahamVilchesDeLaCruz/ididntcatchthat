import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class GameSubcategoryInvalid extends DomainException {
  constructor() {
    super('Subcategory is invalid for the selected module');
  }
}
