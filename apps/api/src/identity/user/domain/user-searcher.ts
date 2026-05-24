import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY, type UserRepository } from './user.repository';
import { Criteria } from '@/shared/domain/criteria';
import { User } from './user';

@Injectable()
export class UserSearcher {
  constructor(
    @Inject(USER_REPOSITORY) private readonly repository: UserRepository,
  ) {}

  async search(email: string): Promise<User | null> {
    const user = await this.repository.match(
      new Criteria([{ field: 'email', operator: '=', value: email }]),
    );

    return user.length > 0 ? user[0] : null;
  }
}
