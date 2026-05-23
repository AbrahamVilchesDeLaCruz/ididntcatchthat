import { Email } from '@/identity/domain/email';
import { EmailInvalidException } from '@/identity/domain/exceptions/email-invalid.exception';
import { Nickname } from '@/identity/domain/nickname';
import { NicknameInvalidException } from '@/identity/domain/exceptions/nickname-invalid.exception';
import { PasswordHash } from '@/identity/domain/password-hash';
import { PasswordHashEmptyException } from '@/identity/domain/exceptions/password-hash-empty.exception';
import { UserRole } from '@/identity/domain/user-role';
import { UserRoleInvalidException } from '@/identity/domain/exceptions/user-role-invalid.exception';
import { OauthProvider } from '@/identity/domain/oauth-provider';
import { OauthProviderInvalidException } from '@/identity/domain/exceptions/oauth-provider-invalid.exception';

describe('identity/domain Value Objects', () => {
  // ── Email ──────────────────────────────────────────────────────────────────
  describe('Email', () => {
    it('should create a valid email', () => {
      const email = new Email('User@Example.COM');
      expect(email.value).toBe('user@example.com');
    });

    it('should throw EmailInvalidException for invalid email', () => {
      expect(() => new Email('not-an-email')).toThrow(EmailInvalidException);
    });
  });

  // ── Nickname ───────────────────────────────────────────────────────────────
  describe('Nickname', () => {
    it('should create a valid nickname', () => {
      const nick = new Nickname('abc');
      expect(nick.value).toBe('abc');
    });

    it('should throw NicknameInvalidException for invalid nickname', () => {
      expect(() => new Nickname('x')).toThrow(NicknameInvalidException);
    });
  });

  // ── PasswordHash ───────────────────────────────────────────────────────────
  describe('PasswordHash', () => {
    it('should create a valid password hash', () => {
      const hash = new PasswordHash('bcrypt$hash');
      expect(hash.value).toBe('bcrypt$hash');
    });

    it('should throw PasswordHashEmptyException for empty string', () => {
      expect(() => new PasswordHash('')).toThrow(PasswordHashEmptyException);
    });

    it('should throw PasswordHashEmptyException for whitespace-only string', () => {
      expect(() => new PasswordHash('   ')).toThrow(PasswordHashEmptyException);
    });
  });

  // ── UserRole ───────────────────────────────────────────────────────────────
  describe('UserRole', () => {
    it('should create a valid role', () => {
      const role = UserRole.create('user');
      expect(role.value).toBe('user');
    });

    it('should throw UserRoleInvalidException for unknown role', () => {
      expect(() => UserRole.create('superadmin')).toThrow(
        UserRoleInvalidException,
      );
    });
  });

  // ── OauthProvider ──────────────────────────────────────────────────────────
  describe('OauthProvider', () => {
    it('should create a valid oauth provider', () => {
      const provider = OauthProvider.create('google');
      expect(provider.value).toBe('google');
    });

    it('should throw OauthProviderInvalidException for unknown provider', () => {
      expect(() => OauthProvider.create('facebook')).toThrow(
        OauthProviderInvalidException,
      );
    });
  });
});
