import { Inject, Injectable } from '@nestjs/common';
import { RankingKey } from '@/ranking/shared/domain/ranking-key';
import {
  type RankingLeaderboardQuery,
  RANKING_LEADERBOARD_QUERY,
} from '@/ranking/search/domain/ranking-leaderboard.query';
import {
  type RankingProfileQuery,
  RANKING_PROFILE_QUERY,
} from '@/ranking/shared/domain/ranking-profile.query';
import { RankingViewerProjector } from '@/ranking/search/domain/ranking-viewer-projector';
import { type RequestRankingSearcher } from './request-ranking-searcher';
import {
  ResponseRankingSearcher,
  type ResponseRankingSearcherPrimitives,
} from './response-ranking-searcher';

export type { RequestRankingSearcher } from './request-ranking-searcher';
export type { ResponseRankingSearcherPrimitives } from './response-ranking-searcher';

@Injectable()
export class RankingSearcher {
  constructor(
    @Inject(RANKING_LEADERBOARD_QUERY)
    private readonly leaderboardQuery: RankingLeaderboardQuery,
    @Inject(RANKING_PROFILE_QUERY)
    private readonly profileQuery: RankingProfileQuery,
    private readonly viewerProjector: RankingViewerProjector,
  ) {}

  async execute(
    request: RequestRankingSearcher,
  ): Promise<ResponseRankingSearcherPrimitives> {
    const key = RankingKey.create(request.type, request.period, request.module);
    const limit = Math.min(Math.max(request.limit ?? 10, 1), 50);

    const entries = await this.leaderboardQuery.selectLeaderboard(key, limit);
    const entryPrimitives = entries.map((entry) => entry.toPrimitives());

    let currentUser =
      entryPrimitives.find((entry) => entry.userId === request.userId) ?? null;

    if (!currentUser) {
      const userEntry = await this.leaderboardQuery.selectUserEntry(
        key,
        request.userId,
      );
      currentUser = userEntry?.toPrimitives() ?? null;
    }

    const preferences = await this.profileQuery.findUserRankingPreferences(
      request.userId,
    );

    const viewer = this.viewerProjector.project(preferences, currentUser);

    return ResponseRankingSearcher.fromParts({
      entries: entryPrimitives.map((entry) => ({
        ...entry,
        isMe: entry.userId === request.userId,
      })),
      currentUser,
      viewer,
    }).toResponse();
  }
}
