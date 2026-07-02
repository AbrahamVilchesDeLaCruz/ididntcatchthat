import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class RankingPeriodInvalid extends DomainException {
  constructor(value: string) {
    super(`RankingPeriod value <${value}> is invalid`);
  }
}
