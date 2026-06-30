import { type UserId } from '@/shared/domain/user-id';

export interface ModuleCoverageQuery {
  hasTouchedAllModules(userId: UserId): Promise<boolean>;
}

export const MODULE_COVERAGE_QUERY = Symbol('ModuleCoverageQuery');
