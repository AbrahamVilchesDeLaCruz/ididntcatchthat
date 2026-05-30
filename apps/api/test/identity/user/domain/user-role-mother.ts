import { UserRole, UserRoleValue } from '@/identity/user/domain/user-role';

export class UserRoleMother {
  static random(): UserRole {
    const roles = Object.values(UserRoleValue);
    const value = roles[Math.floor(Math.random() * roles.length)];
    return UserRole.create(value);
  }

  static user(): UserRole {
    return UserRole.create(UserRoleValue.User);
  }

  static teacher(): UserRole {
    return UserRole.create(UserRoleValue.Teacher);
  }

  static admin(): UserRole {
    return UserRole.create(UserRoleValue.Admin);
  }

  static invalid(): string {
    return 'superadmin';
  }
}
