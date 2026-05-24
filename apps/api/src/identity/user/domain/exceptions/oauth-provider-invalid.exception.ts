import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class OauthProviderInvalidException extends DomainException {
  constructor(value: string) {
    super(`<${value}> is not a valid OauthProvider`);
  }
}
