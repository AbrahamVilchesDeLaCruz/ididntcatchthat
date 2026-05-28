import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class FlashcardIdInvalid extends DomainException {
  constructor(value?: string) {
    super(
      value
        ? `FlashcardId value <${value}> is not a valid UUID`
        : 'FlashcardId is not a valid UUID',
    );
  }
}
