import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class NicknameInvalidException extends DomainException {
  constructor(value: string) {
    super(
      `<${value}> is not a valid nickname. Must be 3–30 alphanumeric characters or hyphens`,
    );
  }
}
