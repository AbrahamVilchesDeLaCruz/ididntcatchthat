import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class InvalidEventPayload extends DomainException {
  constructor(raw: string) {
    super(`Invalid domain event payload: ${raw}`);
  }
}
