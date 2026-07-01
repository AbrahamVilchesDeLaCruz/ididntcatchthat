import { mock } from 'jest-mock-extended';
import { type GameModuleQuery } from '@/progress/domain/game-module.query';
import { type FlashcardModuleQuery } from '@/progress/domain/flashcard-module.query';
import { type ModuleProgressUpdater } from '@/progress/application/update/module-progress-updater';
import { RandomModuleProgressUpdater } from '@/progress/application/update/random-module-progress-updater';
import { ProgressUserIdMother } from '@test/progress/domain/progress-user-id-mother';
import { ProgressFlashcardIdMother } from '@test/progress/domain/progress-flashcard-id-mother';
import { ModuleNameMother } from '@test/progress/domain/module-name-mother';
import { GameIdMother } from '@test/gaming/domain/game-id-mother';

describe('progress/application/update RandomModuleProgressUpdater', () => {
  const gameModuleQuery = mock<GameModuleQuery>();
  const flashcardModuleQuery = mock<FlashcardModuleQuery>();
  const moduleProgressUpdater = mock<ModuleProgressUpdater>();
  let updater: RandomModuleProgressUpdater;

  beforeEach(() => {
    gameModuleQuery.getModule.mockReset();
    flashcardModuleQuery.getModule.mockReset();
    moduleProgressUpdater.execute.mockReset();
    moduleProgressUpdater.execute.mockResolvedValue(undefined);
    updater = new RandomModuleProgressUpdater(
      gameModuleQuery,
      flashcardModuleQuery,
      moduleProgressUpdater,
    );
  });

  it('should skip when the game has a fixed module', async () => {
    gameModuleQuery.getModule.mockResolvedValue(
      ModuleNameMother.nativeSounds().value,
    );

    await updater.executeForRandomAttempt({
      userId: ProgressUserIdMother.random().value,
      gameId: GameIdMother.random().value,
      flashcardId: ProgressFlashcardIdMother.random().value,
    });

    expect(flashcardModuleQuery.getModule).not.toHaveBeenCalled();
    expect(moduleProgressUpdater.execute).not.toHaveBeenCalled();
  });

  it('should recalculate module progress for random games', async () => {
    const userId = ProgressUserIdMother.random().value;
    const flashcardId = ProgressFlashcardIdMother.random().value;
    const module = ModuleNameMother.nativeSounds().value;
    gameModuleQuery.getModule.mockResolvedValue(null);
    flashcardModuleQuery.getModule.mockResolvedValue(module);

    await updater.executeForRandomAttempt({
      userId,
      gameId: GameIdMother.random().value,
      flashcardId,
    });

    expect(moduleProgressUpdater.execute).toHaveBeenCalledWith({
      userId,
      module,
    });
  });

  it('should skip when flashcard category is unknown', async () => {
    gameModuleQuery.getModule.mockResolvedValue(null);
    flashcardModuleQuery.getModule.mockResolvedValue(null);

    await updater.executeForRandomAttempt({
      userId: ProgressUserIdMother.random().value,
      gameId: GameIdMother.random().value,
      flashcardId: ProgressFlashcardIdMother.random().value,
    });

    expect(moduleProgressUpdater.execute).not.toHaveBeenCalled();
  });
});
