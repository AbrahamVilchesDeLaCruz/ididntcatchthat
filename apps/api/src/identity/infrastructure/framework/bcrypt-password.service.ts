import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { type PasswordService } from '@/identity/domain/password.service';

@Injectable()
export class BcryptPasswordService implements PasswordService {
  private readonly SALT_ROUNDS = 12;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
