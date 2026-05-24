import { mock } from 'jest-mock-extended';
import { NicknameResolver } from '@/identity/user/domain/nickname-resolver';
import { type UserRepository } from '@/identity/user/domain/user.repository';
import { UserMother } from '@test/identity/user/domain/user-mother';

describe('identity/domain NicknameResolver', () => {
  const userRepository = mock<UserRepository>();
  let resolver: NicknameResolver;

  beforeEach(() => {
    userRepository.match.mockReset();
    resolver = new NicknameResolver(userRepository);
  });

  describe('resolve — no collision', () => {
    it('should return sanitized displayName when no existing user has that nickname', async () => {
      userRepository.match.mockResolvedValueOnce([]);

      const result = await resolver.resolve('John Doe');

      expect(result).toBe('john-doe');
      expect(userRepository.match).toHaveBeenCalledTimes(1);
    });

    it('should strip special characters and collapse dashes', async () => {
      userRepository.match.mockResolvedValueOnce([]);

      const result = await resolver.resolve('María José!!');

      // special chars → dashes, collapsed, trimmed
      expect(result).toMatch(/^mar-a-jos-?$/);
    });

    it('should truncate to 20 characters', async () => {
      userRepository.match.mockResolvedValueOnce([]);

      const result = await resolver.resolve('a'.repeat(30));

      expect(result.length).toBeLessThanOrEqual(20);
    });

    it('should pad short base to at least 3 chars with user- prefix', async () => {
      userRepository.match.mockResolvedValueOnce([]);

      // single char after sanitization
      const result = await resolver.resolve('ab');

      expect(result.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('resolve — collision', () => {
    it('should append a 4-digit suffix when nickname already exists', async () => {
      const existing = UserMother.random({ nickname: 'john-doe' });
      userRepository.match.mockResolvedValueOnce([existing]);

      const result = await resolver.resolve('John Doe');

      // format: <base up to 15 chars>-<4 digit number>
      expect(result).toMatch(/^.{1,15}-\d{4}$/);
    });
  });
});
