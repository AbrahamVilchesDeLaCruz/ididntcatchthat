import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class VisitorIdInvalid extends DomainException {
  constructor(value: string) {
    super(
      `Visitor id "${value}" is invalid: must be non-empty and max 100 characters`,
    );
  }
}
