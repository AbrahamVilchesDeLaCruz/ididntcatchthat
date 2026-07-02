import { mock } from 'jest-mock-extended';
import { type Response } from 'express';
import { type ConfigService } from '@nestjs/config';
import { GoogleCallbackAuthGetController } from '@/identity/user/infrastructure/controllers/google-callback-auth-get.controller';
import { type OAuthAuthenticator } from '@/identity/user/application/authenticate/oauth-authenticator';
import { type FingerprintBuilder } from '@/shared/infrastructure/fingerprint-builder';
import { UuidMother } from '@test/shared/domain/uuid-mother';

describe('identity/user/infrastructure GoogleCallbackAuthGetController', () => {
  const authenticator = mock<OAuthAuthenticator>();
  const fingerprintBuilder = mock<FingerprintBuilder>();
  const config = mock<ConfigService>();
  let controller: GoogleCallbackAuthGetController;

  beforeEach(() => {
    authenticator.execute.mockReset();
    fingerprintBuilder.fromRequest.mockReset();
    config.get.mockReset();

    fingerprintBuilder.fromRequest.mockReturnValue('fingerprint-value');
    config.get.mockImplementation((key: string, defaultValue?: string) => {
      if (key === 'NODE_ENV') return 'test';
      if (key === 'FRONTEND_URL')
        return defaultValue ?? 'http://localhost:4001';
      return defaultValue;
    });

    controller = new GoogleCallbackAuthGetController(
      authenticator,
      fingerprintBuilder,
      config,
    );
  });

  it('should set refresh cookie with refreshTokenId from authenticator', async () => {
    const refreshTokenId = UuidMother.random();
    const accessToken = 'access-token';
    authenticator.execute.mockResolvedValueOnce({
      accessToken,
      refreshTokenId,
    });

    const res = mock<Response>();
    res.cookie.mockReturnValue(res);
    res.redirect.mockReturnValue(res);

    await controller.handler('127.0.0.1', 'jest-agent', 'en-US', res, {
      email: 'user@example.com',
      deviceId: UuidMother.random(),
    });

    expect(res.cookie).toHaveBeenCalledWith(
      'refreshToken',
      refreshTokenId,
      expect.objectContaining({ httpOnly: true }),
    );
    expect(res.redirect).toHaveBeenCalledWith(
      302,
      expect.stringContaining(`token=${accessToken}`),
    );
  });
});
