import { type Criteria } from '@/shared/domain/criteria';
import { type RefreshToken } from '@/identity/domain/refresh-token';

export interface RefreshTokenRepository {
  match(criteria: Criteria): Promise<RefreshToken[]>;
  search(id: string): Promise<RefreshToken | null>;
  save(token: RefreshToken): Promise<void>;
  remove(id: string): Promise<void>;
}

export const REFRESH_TOKEN_REPOSITORY = Symbol('RefreshTokenRepository');
