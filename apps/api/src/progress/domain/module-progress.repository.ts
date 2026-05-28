import { type UserId } from '@/shared/domain/user-id';
import { type ModuleProgress } from '@/progress/domain/module-progress';
import { type ModuleName } from '@/progress/domain/module-name';

export interface ModuleProgressRepository {
  save(mp: ModuleProgress): Promise<void>;
  findAll(userId: UserId): Promise<ModuleProgress[]>;
  findByModule(
    userId: UserId,
    module: ModuleName,
  ): Promise<ModuleProgress | null>;
}

export const MODULE_PROGRESS_REPOSITORY = Symbol('ModuleProgressRepository');
