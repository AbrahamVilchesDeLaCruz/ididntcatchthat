import { UserId } from '@/identity/domain/user-id';
import { UserIdInvalidException } from '@/identity/domain/exceptions/user-id-invalid.exception';
import { UserIdMother } from '@test/identity/domain/user-id-mother';

describe('identity/domain UserId', () => {
  it('should create a valid UserId', () => {
    const id = UserIdMother.random();
    expect(id.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it('should generate a random UserId', () => {
    const id = UserId.generate();
    expect(id).toBeInstanceOf(UserId);
    expect(id.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it('should throw UserIdInvalidException for invalid value', () => {
    expect(() => new UserId(UserIdMother.invalid())).toThrow(
      UserIdInvalidException,
    );
  });
});
