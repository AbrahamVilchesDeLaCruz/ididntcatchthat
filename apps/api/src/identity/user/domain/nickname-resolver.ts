import { Inject, Injectable } from '@nestjs/common';
import { Criteria } from '@/shared/domain/criteria';
import {
  type UserRepository,
  USER_REPOSITORY,
} from '@/identity/user/domain/user.repository';

@Injectable()
export class NicknameResolver {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly repository: UserRepository,
  ) {}

  async resolve(displayName: string): Promise<string> {
    const candidate = this.sanitize(displayName);

    const [existing] = await this.repository.match(
      new Criteria([{ field: 'nickname', operator: '=', value: candidate }]),
    );

    if (!existing) return candidate;

    const suffix = Math.floor(Math.random() * 9000) + 1000;
    return `${candidate.slice(0, 15)}-${suffix}`;
  }

  private sanitize(displayName: string): string {
    const base = displayName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 20);

    return base.length >= 3 ? base : `user-${base}`.padEnd(3, '0');
  }
}
