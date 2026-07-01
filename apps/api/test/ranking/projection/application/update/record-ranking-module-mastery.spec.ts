import { mock } from 'jest-mock-extended';
import { RecordRankingModuleMastery } from '@/ranking/projection/application/update/record-ranking-module-mastery';
import { RankingScoreWriter } from '@/ranking/projection/domain/ranking-score-writer';
import { type RankingScoreRepository } from '@/ranking/projection/domain/ranking-score.repository';
import { type RankingProfileQuery } from '@/ranking/shared/domain/ranking-profile.query';
import { type Logger } from '@/shared/domain/logger';
import { RankingEligibleUserMother } from '@test/ranking/shared/domain/ranking-eligible-user-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';
import { ModuleNameMother } from '@test/progress/domain/module-name-mother';
import { ModuleMasteryLevelMother } from '@test/progress/domain/module-mastery-level-mother';

describe('ranking/projection/application/update RecordRankingModuleMastery', () => {
  const repository = mock<RankingScoreRepository>();
  const profileQuery = mock<RankingProfileQuery>();
  const logger = mock<Logger>();
  let recorder: RecordRankingModuleMastery;

  beforeEach(() => {
    repository.search.mockResolvedValue(null);
    repository.save.mockResolvedValue(undefined);
    recorder = new RecordRankingModuleMastery(
      new RankingScoreWriter(repository),
      profileQuery,
      logger,
    );
  });

  it('should skip when user is not eligible', async () => {
    profileQuery.findEligibleUser.mockResolvedValue(null);

    await recorder.execute({
      userId: UserIdMother.random().value,
      module: ModuleNameMother.nativeSounds().value,
      level: ModuleMasteryLevelMother.intermediate(),
    });

    expect(repository.save).not.toHaveBeenCalled();
  });

  it('should apply module_master score when user is eligible', async () => {
    const userId = UserIdMother.random().value;
    const module = ModuleNameMother.nativeSounds().value;
    const level = ModuleMasteryLevelMother.intermediate();
    profileQuery.findEligibleUser.mockResolvedValue(
      RankingEligibleUserMother.random(),
    );

    await recorder.execute({ userId, module, level });

    expect(repository.save).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      'Ranking score updated for module mastery',
      { userId, module, level },
    );
  });
});
