import { OauthProvider } from '@/identity/user/domain/oauth-provider';

export class OauthProviderMother {
  static google(): OauthProvider {
    return OauthProvider.create('google');
  }

  static random(): OauthProvider {
    return this.google();
  }

  static invalid(): string {
    return 'facebook';
  }
}
