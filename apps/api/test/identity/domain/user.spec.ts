import { User } from '@/identity/domain/user';
import { UserRegisteredEvent } from '@/identity/domain/events/user-registered.event';
import { UserMother } from '@test/identity/domain/user-mother';

describe('identity/domain User', () => {
  it('should register a user and record UserRegisteredEvent', () => {
    const user = UserMother.random();

    expect(user).toBeInstanceOf(User);
    const events = user.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(UserRegisteredEvent);
  });

  it('should reconstruct from primitives', () => {
    const original = UserMother.randomWithPassword();
    const primitives = original.toPrimitives();

    const reconstructed = User.fromPrimitives(primitives);

    expect(reconstructed.id.value).toBe(original.id.value);
    expect(reconstructed.email.value).toBe(original.email.value);
    expect(reconstructed.passwordHash?.value).toBe(
      original.passwordHash?.value,
    );
    expect(reconstructed.nickname.value).toBe(original.nickname.value);
  });

  it('should reconstruct from primitives with null passwordHash', () => {
    const original = UserMother.random();
    const primitives = original.toPrimitives();

    const reconstructed = User.fromPrimitives(primitives);

    expect(reconstructed.passwordHash).toBeNull();
  });

  it('should reconstruct from primitives with null oauthProvider', () => {
    const original = UserMother.random();
    const primitives = original.toPrimitives();
    const reconstructed = User.fromPrimitives(primitives);
    expect(reconstructed.oauthProvider).toBeNull();
  });

  it('should return updated User with new avatar via withAvatar', () => {
    const user = UserMother.random();
    const avatarUrl = 'https://example.com/avatar.png';

    const updated = user.withAvatar(avatarUrl);

    expect(updated.avatarUrl).toBe(avatarUrl);
    expect(updated.id.value).toBe(user.id.value);
  });

  it('toPrimitives should serialize all fields', () => {
    const user = UserMother.random();
    const p = user.toPrimitives();

    expect(p.id).toBe(user.id.value);
    expect(p.email).toBe(user.email.value);
    expect(p.passwordHash).toBeNull();
    expect(p.nickname).toBe(user.nickname.value);
    expect(p.oauthProvider).toBeNull();
    expect(p.showInRanking).toBe(true);
    expect(p.currentStreak).toBe(0);
    expect(p.longestStreak).toBe(0);
    expect(p.lastActivityDate).toBeNull();
  });
});
