import { Inject, Injectable } from '@nestjs/common';
import { Criteria, FilterOperator } from '@/shared/domain/criteria';
import { AchievementCatalog } from '@/achievement/catalog/domain/achievement-catalog';
import { UserAchievementViewProjector } from '@/achievement/user-achievement/domain/user-achievement-view-projector';
import {
  type UserAchievementRepository,
  USER_ACHIEVEMENT_REPOSITORY,
} from '@/achievement/user-achievement/domain/user-achievement.repository';
import { type RequestAchievementsSearcher } from './request-achievements-searcher';
import {
  ResponseAchievementsSearcherItem,
  type ResponseAchievementsSearcherItemPrimitives,
} from './response-achievements-searcher';

export type { RequestAchievementsSearcher } from './request-achievements-searcher';
export type { ResponseAchievementsSearcherItemPrimitives } from './response-achievements-searcher';

@Injectable()
export class AchievementsSearcher {
  constructor(
    @Inject(USER_ACHIEVEMENT_REPOSITORY)
    private readonly repository: UserAchievementRepository,
    private readonly catalog: AchievementCatalog,
    private readonly viewProjector: UserAchievementViewProjector,
  ) {}

  async execute({
    userId,
    since,
  }: RequestAchievementsSearcher): Promise<
    ResponseAchievementsSearcherItemPrimitives[]
  > {
    const unlockedAchievements = await this.repository.match(
      new Criteria([
        { field: 'userId', operator: FilterOperator.EQ, value: userId },
      ]),
    );

    return this.viewProjector
      .project(unlockedAchievements, this.catalog.list(), {
        since: since ? new Date(since) : null,
      })
      .map((entry) =>
        ResponseAchievementsSearcherItem.fromViewEntry(entry).toResponse(),
      );
  }
}
