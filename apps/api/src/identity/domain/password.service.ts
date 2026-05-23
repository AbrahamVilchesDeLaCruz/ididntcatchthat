export interface PasswordService {
  hash(plain: string): Promise<string>;
  compare(plain: string, hashed: string): Promise<boolean>;
}

export const PASSWORD_SERVICE = Symbol('PasswordService');
