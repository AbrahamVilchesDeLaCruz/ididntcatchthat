import { Inject, Injectable } from '@nestjs/common';
import { RankingKey } from '@/ranking/domain/ranking-key';
import {
  type RankingSelector,
  RANKING_SELECTOR,
} from '@/ranking/domain/ranking-selector';
import {
  type RankingUserReader,
  RANKING_USER_READER,
} from '@/ranking/domain/ranking-user.reader';
import { type RankingEntryPrimitives } from '@/ranking/domain/ranking-entry';

export type RequestRankingFinder = {
  userId: string;
  type: string;
  period: string;
  module?: string;
  limit?: number;
};

export type RankingEntryResponse = RankingEntryPrimitives & {
  isMe: boolean;
};

export type RankingViewerStatus = 'hidden' | 'visible_unranked' | 'ranked';

export type RankingViewerResponse = {
  showInRanking: boolean;
  nickname: string;
  rank: number | null;
  score: number | null;
  status: RankingViewerStatus;
};

export type RankingFinderResult = {
  entries: RankingEntryResponse[];
  currentUser: RankingEntryPrimitives | null;
  viewer: RankingViewerResponse;
};

@Injectable()
export class RankingFinder {
  constructor(
    @Inject(RANKING_SELECTOR)
    private readonly selector: RankingSelector,
    @Inject(RANKING_USER_READER)
    private readonly userReader: RankingUserReader,
  ) {}

  async execute(request: RequestRankingFinder): Promise<RankingFinderResult> {
    const key = RankingKey.create(request.type, request.period, request.module);
    const limit = Math.min(Math.max(request.limit ?? 10, 1), 50);

    const entries = await this.selector.selectLeaderboard(key, limit);
    const entryPrimitives = entries.map((entry) => entry.toPrimitives());

    let currentUser =
      entryPrimitives.find((entry) => entry.userId === request.userId) ?? null;

    if (!currentUser) {
      const userEntry = await this.selector.selectUserEntry(
        key,
        request.userId,
      );
      currentUser = userEntry?.toPrimitives() ?? null;
    }

    const preferences = await this.userReader.findUserRankingPreferences(
      request.userId,
    );

    const viewer = this.buildViewer(preferences, currentUser);

    return {
      entries: entryPrimitives.map((entry) => ({
        ...entry,
        isMe: entry.userId === request.userId,
      })),
      currentUser,
      viewer,
    };
  }

  private buildViewer(
    preferences: {
      nickname: string;
      showInRanking: boolean;
    } | null,
    currentUser: RankingEntryPrimitives | null,
  ): RankingViewerResponse {
    const showInRanking = preferences?.showInRanking ?? false;
    const nickname = preferences?.nickname ?? '';

    if (!showInRanking) {
      return {
        showInRanking,
        nickname,
        rank: null,
        score: null,
        status: 'hidden',
      };
    }

    if (currentUser !== null && currentUser.score > 0) {
      return {
        showInRanking,
        nickname,
        rank: currentUser.rank,
        score: currentUser.score,
        status: 'ranked',
      };
    }

    return {
      showInRanking,
      nickname,
      rank: null,
      score: null,
      status: 'visible_unranked',
    };
  }
}
