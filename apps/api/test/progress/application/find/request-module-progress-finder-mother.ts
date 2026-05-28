import { type RequestModuleProgressFinder } from '@/progress/application/find/module-progress-finder';
import { ProgressUserIdMother } from '@test/progress/domain/progress-user-id-mother';

export class RequestModuleProgressFinderMother {
  static random(userId?: string): RequestModuleProgressFinder {
    return { userId: userId ?? ProgressUserIdMother.random().value };
  }
}
