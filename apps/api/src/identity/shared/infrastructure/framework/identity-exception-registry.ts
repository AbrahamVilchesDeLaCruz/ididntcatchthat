import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { GlobalExceptionRegistry } from '@/shared/infrastructure/exceptions/global-exception-registry';
import { EmailAlreadyTakenException } from '@/identity/user/domain/exceptions/email-already-taken.exception';
import { NicknameAlreadyTakenException } from '@/identity/user/domain/exceptions/nickname-already-taken.exception';
import { WeakPasswordException } from '@/identity/user/domain/exceptions/weak-password.exception';
import { InvalidCredentialsException } from '@/identity/user/domain/exceptions/invalid-credentials.exception';
import { InvalidRefreshTokenException } from '@/identity/session/domain/exceptions/invalid-refresh-token.exception';
import { ExpiredRefreshTokenException } from '@/identity/session/domain/exceptions/expired-refresh-token.exception';
import { UserSessionCompromisedException } from '@/identity/session/domain/exceptions/user-session-compromised.exception';
import { UserNotFoundException } from '@/identity/user/domain/exceptions/user-not-found.exception';
import { EmailInvalidException } from '@/identity/user/domain/exceptions/email-invalid.exception';
import { NicknameInvalidException } from '@/identity/user/domain/exceptions/nickname-invalid.exception';
import { UserIdInvalidException } from '@/identity/user/domain/exceptions/user-id-invalid.exception';
import { UserRoleInvalidException } from '@/identity/user/domain/exceptions/user-role-invalid.exception';
import { OauthProviderInvalidException } from '@/identity/user/domain/exceptions/oauth-provider-invalid.exception';
import { PasswordHashEmptyException } from '@/identity/user/domain/exceptions/password-hash-empty.exception';

@Injectable()
export class IdentityExceptionRegistry implements OnModuleInit {
  constructor(private readonly globalRegistry: GlobalExceptionRegistry) {}

  onModuleInit(): void {
    this.globalRegistry.register(
      new Map<string, number>([
        [EmailAlreadyTakenException.name, HttpStatus.CONFLICT],
        [NicknameAlreadyTakenException.name, HttpStatus.CONFLICT],
        [WeakPasswordException.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [InvalidCredentialsException.name, HttpStatus.UNAUTHORIZED],
        [InvalidRefreshTokenException.name, HttpStatus.UNAUTHORIZED],
        [ExpiredRefreshTokenException.name, HttpStatus.UNAUTHORIZED],
        [UserSessionCompromisedException.name, HttpStatus.UNAUTHORIZED],
        [UserNotFoundException.name, HttpStatus.NOT_FOUND],
        [EmailInvalidException.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [NicknameInvalidException.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [UserIdInvalidException.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [UserRoleInvalidException.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [OauthProviderInvalidException.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [PasswordHashEmptyException.name, HttpStatus.UNPROCESSABLE_ENTITY],
      ]),
    );
  }
}
