import { StringValueObject } from '@/shared/domain/string-value-object';
import { OauthProviderInvalid } from '@/identity/domain/oauth-provider-invalid';

export type OauthProviderValue = 'google';

const VALID_PROVIDERS: OauthProviderValue[] = ['google'];

export class OauthProvider extends StringValueObject {
  declare readonly value: OauthProviderValue;

  private constructor(value: OauthProviderValue) {
    super(value);
  }

  static create(value: string): OauthProvider {
    if (!VALID_PROVIDERS.includes(value as OauthProviderValue)) {
      throw new OauthProviderInvalid(value);
    }
    return new OauthProvider(value as OauthProviderValue);
  }
}
