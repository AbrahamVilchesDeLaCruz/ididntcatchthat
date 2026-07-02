import { UserFlashcardStatsMother } from '@test/progress/domain/user-flashcard-stats-mother';
import { ModuleProgress } from '@/progress/domain/module-progress';
import { ProgressUserIdMother } from '@test/progress/domain/progress-user-id-mother';
import { ModuleNameMother } from '@test/progress/domain/module-name-mother';

describe('progress/domain ModuleProgress', () => {
  it('should mark levelIncreased on first persistence when mastery rises above zero', () => {
    const userId = ProgressUserIdMother.random();
    const module = ModuleNameMother.random();

    const result = ModuleProgress.computeFrom(
      [
        UserFlashcardStatsMother.create({
          timesPlayed: 5,
          correctCount: 3,
          accuracyRate: 0.6,
        }),
      ],
      null,
      userId,
      module,
    );

    expect(result.newLevel).toBe(1);
    expect(result.previousLevel).toBe(0);
    expect(result.levelIncreased).toBe(true);
    expect(result.progress.pullDomainEvents()[0]?.eventName()).toBe(
      'idct.progress.module_progress.module_mastery_level.increased',
    );
  });
});
