import { AggregateRoot } from '@/shared/domain/aggregate-root';
import { UserId } from '@/identity/domain/user-id';
import { Email } from '@/identity/domain/email';
import { PasswordHash } from '@/identity/domain/password-hash';
import { Nickname } from '@/identity/domain/nickname';
import { UserRole } from '@/identity/domain/user-role';
import { OauthProvider } from '@/identity/domain/oauth-provider';
import { UserRegisteredEvent } from '@/identity/domain/user-registered.event';

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
  private constructor(
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

  static register(params: {
    id: UserId;
    email: Email;
    passwordHash: PasswordHash | null;
    nickname: Nickname;
    avatarUrl: string | null;
    role: UserRole;
    oauthProvider: OauthProvider | null;
    deviceId: string;
  }): User {
    const now = new Date();

    const user = new User(
      params.id,
      params.email,
      params.passwordHash,
      params.nickname,
      params.avatarUrl,
      params.role,
      params.oauthProvider,
      true,
      0,
      0,
      null,
      now,
      now,
    );

    user.record(
      new UserRegisteredEvent(params.id.value, {
        email: params.email.value,
        nickname: params.nickname.value,
        deviceId: params.deviceId,
      }),
    );

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
