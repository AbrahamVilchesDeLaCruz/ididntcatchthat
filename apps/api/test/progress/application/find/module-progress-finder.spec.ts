import { mock } from 'jest-mock-extended';
import { type ModuleProgressRepository } from '@/progress/domain/module-progress.repository';
import { type StudyLevelQuery } from '@/progress/domain/study-level.query';
import { ModuleProgressFinder } from '@/progress/application/find/module-progress-finder';
import { ModuleProgressMother } from '@test/progress/domain/module-progress-mother';
import { ProgressUserIdMother } from '@test/progress/domain/progress-user-id-mother';
import { RequestModuleProgressFinderMother } from './request-module-progress-finder-mother';

describe('progress/application/find ModuleProgressFinder', () => {
  const repository = mock<ModuleProgressRepository>();
  const studyLevelQuery = mock<StudyLevelQuery>();
  let finder: ModuleProgressFinder;

  beforeEach(() => {
    repository.findAll.mockReset();
    studyLevelQuery.findByUserId.mockReset();
    studyLevelQuery.findByUserId.mockResolvedValue([]);
    finder = new ModuleProgressFinder(repository, studyLevelQuery);
  });

  it('should return modules progress sorted by masteryLevel DESC', async () => {
    const userId = ProgressUserIdMother.random().value;
    const level0 = ModuleProgressMother.random({
      userId,
      module: 'flow_connectors',
      masteryLevel: 0,
      totalAttempts: 0,
      accuracy: 0,
    });
    const level2 = ModuleProgressMother.random({
      userId,
      module: 'native_sounds',
      masteryLevel: 2,
      totalAttempts: 15,
      accuracy: 0.75,
    });
    const level1 = ModuleProgressMother.random({
      userId,
      module: 'connected_speech',
      masteryLevel: 1,
      totalAttempts: 6,
      accuracy: 0.6,
    });
    repository.findAll.mockResolvedValue([level0, level2, level1]);

    const result = await finder.execute(
      RequestModuleProgressFinderMother.random(userId),
    );

    expect(result).toHaveLength(4);
    expect(result[0].masteryLevel).toBe(2);
    expect(result[1].masteryLevel).toBe(1);
    expect(result.filter((item) => item.masteryLevel === 0)).toHaveLength(2);
  });

  it('should return default progress for all modules when user has no progress', async () => {
    const userId = ProgressUserIdMother.random().value;
    repository.findAll.mockResolvedValue([]);

    const result = await finder.execute(
      RequestModuleProgressFinderMother.random(userId),
    );

    expect(result).toHaveLength(4);
    expect(result.every((item) => item.masteryLevel === 0)).toBe(true);
    expect(result.every((item) => item.studyLevel === 0)).toBe(true);
    expect(result.every((item) => item.studyCoverage === 0)).toBe(true);
  });

  it('should return primitives not domain objects', async () => {
    const userId = ProgressUserIdMother.random().value;
    repository.findAll.mockResolvedValue([
      ModuleProgressMother.random({ userId, module: 'native_sounds' }),
    ]);

    const result = await finder.execute(
      RequestModuleProgressFinderMother.random(userId),
    );

    expect(typeof result[0].userId).toBe('string');
    expect(typeof result[0].module).toBe('string');
    expect(typeof result[0].masteryLevel).toBe('number');
    expect(typeof result[0].studyLevel).toBe('number');
  });
});
