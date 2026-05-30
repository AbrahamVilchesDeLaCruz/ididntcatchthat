import { StringValueObject } from '@/shared/domain/string-value-object';
import { OauthProviderInvalidException } from '@/identity/user/domain/exceptions/oauth-provider-invalid.exception';

export type OauthProviderValue = 'google';

const VALID_PROVIDERS: OauthProviderValue[] = ['google'];

export class OauthProvider extends StringValueObject {
  declare readonly value: OauthProviderValue;

  public constructor(value: OauthProviderValue) {
    super(value);
  }

  static create(value: string): OauthProvider {
    if (!VALID_PROVIDERS.includes(value as OauthProviderValue)) {
      throw new OauthProviderInvalidException(value);
    }
    return new OauthProvider(value as OauthProviderValue);
  }
}
