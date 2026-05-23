import { type Criteria } from '@/shared/domain/criteria';
import { type User } from '@/identity/domain/user';
import { type UserId } from '@/identity/domain/user-id';

export interface UserRepository {
  match(criteria: Criteria): Promise<User[]>;
  search(id: UserId): Promise<User | null>;
  save(user: User): Promise<void>;
  remove(id: UserId): Promise<void>;
}

export const USER_REPOSITORY = Symbol('UserRepository');
