import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class AchievementKeyUnknown extends DomainException {
  constructor(key: string) {
    super(`Unknown achievement key <${key}>`);
  }
}
