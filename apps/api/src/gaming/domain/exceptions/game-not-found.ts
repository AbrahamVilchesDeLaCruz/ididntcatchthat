import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class GameNotFound extends DomainException {
  constructor(id: string) {
    super(`Game with id <${id}> not found`);
  }
}
