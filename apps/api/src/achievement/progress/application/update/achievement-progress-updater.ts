import { Inject, Injectable } from '@nestjs/common';
import { type GameCompletedAttributes } from '@/gaming/domain/events/game-completed.event';
import { type AttemptRecordedAttributes } from '@/gaming/domain/events/attempt-recorded.event';
import { type FlashcardViewedAttributes } from '@/gaming/domain/events/flashcard-viewed.event';
import { UserId } from '@/shared/domain/user-id';
import { UserAchievementProgress } from '@/achievement/progress/domain/user-achievement-progress';
import {
  type UserAchievementProgressRepository,
  USER_ACHIEVEMENT_PROGRESS_REPOSITORY,
} from '@/achievement/progress/domain/user-achievement-progress.repository';

@Injectable()
export class AchievementProgressUpdater {
  constructor(
    @Inject(USER_ACHIEVEMENT_PROGRESS_REPOSITORY)
    private readonly repository: UserAchievementProgressRepository,
  ) {}

  async applyGameCompleted(
    attrs: GameCompletedAttributes,
  ): Promise<UserAchievementProgress> {
    const userId = new UserId(attrs.userId!);
    const progress = await this.findOrCreate(userId);

    if (attrs.mode === 'game') {
      progress.recordGameCompleted(attrs.module);
    } else if (attrs.mode === 'study') {
      progress.recordStudyCompleted(attrs.module);
    }

    await this.repository.save(progress);
    return progress;
  }

  async applyAttemptRecorded(
    attrs: AttemptRecordedAttributes,
  ): Promise<UserAchievementProgress | null> {
    if (attrs.userId === null || attrs.mode !== 'game') return null;

    const userId = new UserId(attrs.userId);
    const progress = await this.findOrCreate(userId);
    progress.recordPlayedAttempt(attrs.flashcardModule);
    await this.repository.save(progress);
    return progress;
  }

  async applyFlashcardViewed(
    attrs: FlashcardViewedAttributes,
  ): Promise<UserAchievementProgress | null> {
    if (attrs.userId === null) return null;

    const userId = new UserId(attrs.userId);
    const progress = await this.findOrCreate(userId);
    progress.recordStudiedModule(attrs.flashcardModule);
    await this.repository.save(progress);
    return progress;
  }

  private async findOrCreate(userId: UserId): Promise<UserAchievementProgress> {
    const existing = await this.repository.search(userId);
    return existing ?? UserAchievementProgress.create(userId);
  }
}
