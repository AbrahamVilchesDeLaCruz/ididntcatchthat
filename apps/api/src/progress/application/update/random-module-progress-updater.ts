import { Inject, Injectable } from '@nestjs/common';
import { LEARNING_MODULES } from '@/shared/domain/learning-module';
import {
  type FlashcardModuleQuery,
  FLASHCARD_MODULE_QUERY,
} from '@/progress/domain/flashcard-module.query';
import {
  type GameModuleQuery,
  GAME_MODULE_QUERY,
} from '@/progress/domain/game-module.query';
import { ModuleProgressUpdater } from './module-progress-updater';

export type RequestRandomModuleProgressOnAttempt = {
  userId: string;
  gameId: string;
  flashcardId: string;
};

@Injectable()
export class RandomModuleProgressUpdater {
  private static readonly VALID_MODULES = new Set<string>(LEARNING_MODULES);

  constructor(
    @Inject(GAME_MODULE_QUERY)
    private readonly gameModuleQuery: GameModuleQuery,
    @Inject(FLASHCARD_MODULE_QUERY)
    private readonly flashcardModuleQuery: FlashcardModuleQuery,
    @Inject(ModuleProgressUpdater)
    private readonly moduleProgressUpdater: ModuleProgressUpdater,
  ) {}

  async executeForRandomAttempt({
    userId,
    gameId,
    flashcardId,
  }: RequestRandomModuleProgressOnAttempt): Promise<void> {
    const gameModule = await this.gameModuleQuery.getModule(gameId);
    if (gameModule !== null) return;

    const module = await this.flashcardModuleQuery.getModule(flashcardId);
    if (
      module === null ||
      !RandomModuleProgressUpdater.VALID_MODULES.has(module)
    ) {
      return;
    }

    await this.moduleProgressUpdater.execute({ userId, module });
  }
}
