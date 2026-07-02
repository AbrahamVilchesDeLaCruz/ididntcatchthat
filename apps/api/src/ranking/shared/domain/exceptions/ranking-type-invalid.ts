import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class RankingTypeInvalid extends DomainException {
  constructor(value: string) {
    super(`RankingType value <${value}> is invalid`);
  }
}
