import { UserAchievementProgress } from '@/achievement/progress/domain/user-achievement-progress';
import { ACTIVE_MODULES } from '@/achievement/shared/domain/active-modules';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';

describe('achievement/progress/domain UserAchievementProgress', () => {
  it('should be an aggregate root', () => {
    const progress = UserAchievementProgress.create(UserIdMother.random());

    expect(progress.pullDomainEvents()).toEqual([]);
  });

  it('should track game completion and module coverage from event data', () => {
    const userId = UserIdMother.random();
    const progress = UserAchievementProgress.create(userId);

    progress.recordGameCompleted('native_sounds');
    progress.recordPlayedAttempt('connected_speech');
    progress.recordStudiedModule('flow_connectors');
    progress.recordStudiedModule('real_talk');

    expect(progress.completedGamesCount).toBe(1);
    expect(progress.totalPlayedAttempts).toBe(1);
    expect(progress.hasTouchedAllModules()).toBe(true);
    expect([...progress.touchedModules].sort()).toEqual(
      [...ACTIVE_MODULES].sort(),
    );
  });

  it('should round-trip through primitives', () => {
    const progress = UserAchievementProgress.create(UserIdMother.random());
    progress.recordGameCompleted('native_sounds');
    progress.recordPlayedAttempt('connected_speech');

    const restored = UserAchievementProgress.fromPrimitives(
      progress.toPrimitives(),
    );

    expect(restored.toPrimitives()).toEqual(progress.toPrimitives());
  });
});
