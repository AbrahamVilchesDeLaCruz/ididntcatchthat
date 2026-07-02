import { type RequestModuleProgressUpdater } from '@/progress/application/update/module-progress-updater';
import { ProgressUserIdMother } from '@test/progress/domain/progress-user-id-mother';
import { ModuleNameMother } from '@test/progress/domain/module-name-mother';

export class RequestModuleProgressUpdaterMother {
  static random(
    overrides?: Partial<RequestModuleProgressUpdater>,
  ): RequestModuleProgressUpdater {
    return {
      userId: ProgressUserIdMother.random().value,
      module: ModuleNameMother.nativeSounds().value,
      ...overrides,
    };
  }
}
