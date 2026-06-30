import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class AchievementKeyEmpty extends DomainException {
  constructor() {
    super('Achievement key cannot be empty');
  }
}
