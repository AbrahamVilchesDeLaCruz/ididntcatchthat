import { DomainException } from '@/shared/domain/domain-exception';

export class EmailAlreadyTaken extends DomainException {
  constructor(email: string) {
    super(`Email <${email}> is already taken`);
  }
}
