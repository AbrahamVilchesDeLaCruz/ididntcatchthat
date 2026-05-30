import { AggregateRoot } from '@/shared/domain/aggregate-root';
import { UserId } from '@/shared/domain/user-id';
import { Email } from '@/identity/user/domain/email';
import { PasswordHash } from '@/identity/user/domain/password-hash';
import { Nickname } from '@/identity/user/domain/nickname';
import { UserRole } from '@/identity/user/domain/user-role';
import { OauthProvider } from '@/identity/user/domain/oauth-provider';
import { UserRegisteredEvent } from '@/identity/user/domain/events/user-registered.event';

export type UserPrimitives = {
  id: string;
  email: string;
  passwordHash: string | null;
  nickname: string;
  avatarUrl: string | null;
  role: string;
  oauthProvider: string | null;
  showInRanking: boolean;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class User extends AggregateRoot<UserPrimitives> {
  public constructor(
    readonly id: UserId,
    readonly email: Email,
    readonly passwordHash: PasswordHash | null,
    readonly nickname: Nickname,
    readonly avatarUrl: string | null,
    readonly role: UserRole,
    readonly oauthProvider: OauthProvider | null,
    readonly showInRanking: boolean,
    readonly currentStreak: number,
    readonly longestStreak: number,
    readonly lastActivityDate: Date | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {
    super();
  }

  static register(
    id: string,
    email: string,
    passwordHash: string | null,
    nickname: string,
    avatarUrl: string | null,
    role: string,
    oauthProvider: string | null,
  ): User {
    const now = new Date();

    const user = new User(
      new UserId(id),
      new Email(email),
      passwordHash ? new PasswordHash(passwordHash) : null,
      new Nickname(nickname),
      avatarUrl,
      UserRole.create(role),
      oauthProvider ? OauthProvider.create(oauthProvider) : null,
      true,
      0,
      0,
      null,
      now,
      now,
    );

    user.record(new UserRegisteredEvent(user.id.value, user.toPrimitives()));

    return user;
  }

  static fromPrimitives(p: UserPrimitives): User {
    return new User(
      new UserId(p.id),
      new Email(p.email),
      p.passwordHash ? new PasswordHash(p.passwordHash) : null,
      new Nickname(p.nickname),
      p.avatarUrl,
      UserRole.create(p.role),
      p.oauthProvider ? OauthProvider.create(p.oauthProvider) : null,
      p.showInRanking,
      p.currentStreak,
      p.longestStreak,
      p.lastActivityDate,
      p.createdAt,
      p.updatedAt,
    );
  }

  addAvatar(avatarUrl: string): User {
    return User.fromPrimitives({
      ...this.toPrimitives(),
      avatarUrl,
    });
  }

  toPrimitives(): UserPrimitives {
    return {
      id: this.id.value,
      email: this.email.value,
      passwordHash: this.passwordHash?.value ?? null,
      nickname: this.nickname.value,
      avatarUrl: this.avatarUrl,
      role: this.role.value,
      oauthProvider: this.oauthProvider?.value ?? null,
      showInRanking: this.showInRanking,
      currentStreak: this.currentStreak,
      longestStreak: this.longestStreak,
      lastActivityDate: this.lastActivityDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
