import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class PagePathInvalid extends DomainException {
  constructor(value: string) {
    super(
      `Page path "${value}" is invalid: must be non-empty and max 500 characters`,
    );
  }
}
