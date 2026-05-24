import { type Criteria } from '@/shared/domain/criteria';
import { type UserSession } from '@/identity/session/domain/user-session';

export interface UserSessionRepository {
  match(criteria: Criteria): Promise<UserSession[]>;
  search(id: string): Promise<UserSession | null>;
  save(session: UserSession): Promise<void>;
  remove(id: string): Promise<void>;
}

export const USER_SESSION_REPOSITORY = Symbol('UserSessionRepository');
