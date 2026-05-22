import { DomainException } from '@/shared/domain/domain-exception';

export class UserNotFound extends DomainException {
  constructor(id: string) {
    super(`User <${id}> not found`);
  }
}
