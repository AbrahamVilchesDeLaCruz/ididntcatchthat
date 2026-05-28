import { ModuleProgress } from '@/progress/domain/module-progress';
import { ProgressUserIdMother } from './progress-user-id-mother';
import { ModuleNameMother } from './module-name-mother';
import { DateMother } from '../../shared/domain/date-mother';
import { MotherCreator } from '../../shared/domain/mother-creator';

export class ModuleProgressMother {
  static random(
    overrides?: Partial<{
      userId: string;
      module: string;
      totalAttempts: number;
      correctCount: number;
      accuracy: number;
      masteryLevel: number;
      lastPlayedAt: string;
      updatedAt: string;
    }>,
  ): ModuleProgress {
    const totalAttempts =
      overrides?.totalAttempts ??
      MotherCreator.random().number.int({ min: 0, max: 50 });
    const accuracy =
      overrides?.accuracy ??
      MotherCreator.random().number.float({
        min: 0,
        max: 1,
        fractionDigits: 2,
      });

    return ModuleProgress.fromPrimitives({
      userId: overrides?.userId ?? ProgressUserIdMother.random().value,
      module: overrides?.module ?? ModuleNameMother.random().value,
      totalAttempts,
      correctCount:
        overrides?.correctCount ?? Math.floor(totalAttempts * accuracy),
      accuracy,
      masteryLevel:
        overrides?.masteryLevel ??
        ModuleProgress.computeMasteryLevel(totalAttempts, accuracy),
      lastPlayedAt:
        overrides?.lastPlayedAt ?? DateMother.recent().toISOString(),
      updatedAt: overrides?.updatedAt ?? DateMother.recent().toISOString(),
    });
  }
}
