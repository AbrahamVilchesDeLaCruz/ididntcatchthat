import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class AchievementCategoryInvalid extends DomainException {
  constructor(category: string) {
    super(`Invalid achievement category <${category}>`);
  }
}
