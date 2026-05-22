import { StringValueObject } from '@/shared/domain/string-value-object';
import { UserRoleInvalid } from '@/identity/domain/user-role-invalid';

export type UserRoleValue = 'user' | 'teacher' | 'admin';

const VALID_ROLES: UserRoleValue[] = ['user', 'teacher', 'admin'];

export class UserRole extends StringValueObject {
  declare readonly value: UserRoleValue;

  private constructor(value: UserRoleValue) {
    super(value);
  }

  static create(value: string): UserRole {
    if (!VALID_ROLES.includes(value as UserRoleValue)) {
      throw new UserRoleInvalid(value);
    }
    return new UserRole(value as UserRoleValue);
  }
}
