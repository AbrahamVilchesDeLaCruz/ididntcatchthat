import { Inject, Injectable } from '@nestjs/common';
import { type ModuleProgressWithStudyPrimitives } from '@/progress/domain/module-progress';
import {
  type ModuleProgressRepository,
  MODULE_PROGRESS_REPOSITORY,
} from '@/progress/domain/module-progress.repository';
import {
  type StudyLevelQuery,
  STUDY_LEVEL_QUERY,
} from '@/progress/domain/study-level.query';
import { UserId } from '@/shared/domain/user-id';
import { type RequestModuleProgressFinder } from './request-module-progress-finder';

export type { RequestModuleProgressFinder };

import { LEARNING_MODULES } from '@/shared/domain/learning-module';

@Injectable()
export class ModuleProgressFinder {
  constructor(
    @Inject(MODULE_PROGRESS_REPOSITORY)
    private readonly repository: ModuleProgressRepository,
    @Inject(STUDY_LEVEL_QUERY)
    private readonly studyLevelQuery: StudyLevelQuery,
  ) {}

  async execute({
    userId,
  }: RequestModuleProgressFinder): Promise<
    ModuleProgressWithStudyPrimitives[]
  > {
    const uid = new UserId(userId);
    const [progressList, studyLevels] = await Promise.all([
      this.repository.findAll(uid),
      this.studyLevelQuery.findByUserId(userId),
    ]);

    const progressByModule = new Map(
      progressList.map((mp) => [mp.module.value, mp]),
    );
    const studyByModule = new Map(studyLevels.map((s) => [s.module, s]));

    return LEARNING_MODULES.map((module) => {
      const existing = progressByModule.get(module);
      const study = studyByModule.get(module) ?? {
        studyLevel: 0,
        studyCoverage: 0,
      };

      if (existing) {
        return {
          ...existing.toPrimitives(),
          studyLevel: study.studyLevel,
          studyCoverage: study.studyCoverage,
        };
      }

      return {
        userId,
        module,
        totalAttempts: 0,
        correctCount: 0,
        accuracy: 0,
        masteryLevel: 0,
        lastPlayedAt: new Date(0).toISOString(),
        updatedAt: new Date(0).toISOString(),
        studyLevel: study.studyLevel,
        studyCoverage: study.studyCoverage,
      };
    }).sort((a, b) => b.masteryLevel - a.masteryLevel);
  }
}
