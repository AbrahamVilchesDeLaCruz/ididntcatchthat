import { StringValueObject } from '@/shared/domain/string-value-object';
import { UserRoleInvalidException } from '@/identity/user/domain/exceptions/user-role-invalid.exception';

export enum UserRoleValue {
  User = 'user',
  Teacher = 'teacher',
  Admin = 'admin',
}

const VALID_ROLES = Object.values(UserRoleValue);

export class UserRole extends StringValueObject {
  declare readonly value: UserRoleValue;

  private constructor(value: UserRoleValue) {
    super(value);
  }

  static create(value: string): UserRole {
    if (!VALID_ROLES.includes(value as UserRoleValue)) {
      throw new UserRoleInvalidException(value);
    }
    return new UserRole(value as UserRoleValue);
  }
}
