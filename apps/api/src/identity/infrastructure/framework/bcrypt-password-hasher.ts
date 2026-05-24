import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { type PasswordHasher } from '@/identity/domain/password-hasher';

@Injectable()
export class BcryptPasswordHasher implements PasswordHasher {
  private readonly SALT_ROUNDS = 12;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
