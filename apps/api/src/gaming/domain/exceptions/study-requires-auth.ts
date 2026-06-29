import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class StudyRequiresAuth extends DomainException {
  constructor() {
    super('Study mode requires a registered user account');
  }
}
