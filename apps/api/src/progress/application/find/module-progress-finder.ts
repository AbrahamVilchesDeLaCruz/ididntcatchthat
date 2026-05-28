import { Inject, Injectable } from '@nestjs/common';
import { type ModuleProgressPrimitives } from '@/progress/domain/module-progress';
import {
  type ModuleProgressRepository,
  MODULE_PROGRESS_REPOSITORY,
} from '@/progress/domain/module-progress.repository';
import { UserId } from '@/shared/domain/user-id';

export interface RequestModuleProgressFinder {
  userId: string;
}

@Injectable()
export class ModuleProgressFinder {
  constructor(
    @Inject(MODULE_PROGRESS_REPOSITORY)
    private readonly repository: ModuleProgressRepository,
  ) {}

  async execute(
    request: RequestModuleProgressFinder,
  ): Promise<ModuleProgressPrimitives[]> {
    const results = await this.repository.findAll(new UserId(request.userId));
    return results
      .sort((a, b) => b.masteryLevel - a.masteryLevel)
      .map((mp) => mp.toPrimitives());
  }
}
