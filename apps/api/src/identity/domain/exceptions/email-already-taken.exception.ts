import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class EmailAlreadyTakenException extends DomainException {
  constructor(email: string) {
    super(`Email <${email}> is already taken`);
  }
}
