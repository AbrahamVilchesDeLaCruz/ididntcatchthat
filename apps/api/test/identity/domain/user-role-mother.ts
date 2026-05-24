import { UserRole, type UserRoleValue } from '@/identity/domain/user-role';

export class UserRoleMother {
  static random(): UserRole {
    const roles: UserRoleValue[] = ['user', 'teacher', 'admin'];
    const value = roles[Math.floor(Math.random() * roles.length)];
    return UserRole.create(value);
  }

  static user(): UserRole {
    return UserRole.create('user');
  }

  static teacher(): UserRole {
    return UserRole.create('teacher');
  }

  static admin(): UserRole {
    return UserRole.create('admin');
  }

  static invalid(): string {
    return 'superadmin';
  }
}
