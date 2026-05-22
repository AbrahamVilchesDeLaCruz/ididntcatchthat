import { DomainException } from '@/shared/domain/domain-exception';

export class OauthProviderInvalid extends DomainException {
  constructor(value: string) {
    super(`<${value}> is not a valid OauthProvider`);
  }
}
