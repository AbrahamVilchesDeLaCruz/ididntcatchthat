import { mock } from 'jest-mock-extended';
import { type ModuleProgressRepository } from '@/progress/domain/module-progress.repository';
import { ModuleProgressFinder } from '@/progress/application/find/module-progress-finder';
import { ModuleProgressMother } from '@test/progress/domain/module-progress-mother';
import { ProgressUserIdMother } from '@test/progress/domain/progress-user-id-mother';
import { RequestModuleProgressFinderMother } from './request-module-progress-finder-mother';

describe('progress/application/find ModuleProgressFinder', () => {
  const repository = mock<ModuleProgressRepository>();
  let finder: ModuleProgressFinder;

  beforeEach(() => {
    repository.findAll.mockReset();
    finder = new ModuleProgressFinder(repository);
  });

  it('should return modules progress sorted by masteryLevel DESC', async () => {
    const userId = ProgressUserIdMother.random().value;
    const level0 = ModuleProgressMother.random({
      userId,
      masteryLevel: 0,
      totalAttempts: 0,
      accuracy: 0,
    });
    const level2 = ModuleProgressMother.random({
      userId,
      masteryLevel: 2,
      totalAttempts: 15,
      accuracy: 0.75,
    });
    const level1 = ModuleProgressMother.random({
      userId,
      masteryLevel: 1,
      totalAttempts: 6,
      accuracy: 0.6,
    });
    repository.findAll.mockResolvedValue([level0, level2, level1]);

    const result = await finder.execute(
      RequestModuleProgressFinderMother.random(userId),
    );

    expect(result[0].masteryLevel).toBe(2);
    expect(result[1].masteryLevel).toBe(1);
    expect(result[2].masteryLevel).toBe(0);
  });

  it('should return empty array when user has no progress', async () => {
    repository.findAll.mockResolvedValue([]);

    const result = await finder.execute(
      RequestModuleProgressFinderMother.random(),
    );

    expect(result).toEqual([]);
  });

  it('should return primitives not domain objects', async () => {
    const userId = ProgressUserIdMother.random().value;
    repository.findAll.mockResolvedValue([
      ModuleProgressMother.random({ userId }),
    ]);

    const result = await finder.execute(
      RequestModuleProgressFinderMother.random(userId),
    );

    expect(typeof result[0].userId).toBe('string');
    expect(typeof result[0].module).toBe('string');
    expect(typeof result[0].masteryLevel).toBe('number');
  });
});
