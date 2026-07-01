import { Injectable } from '@nestjs/common';
import { type RankingEntryPrimitives } from '@/ranking/search/domain/ranking-entry';
import { type RankingUserPreferences } from '@/ranking/shared/domain/ranking-profile.query';

export type RankingViewerStatus = 'hidden' | 'visible_unranked' | 'ranked';

export type RankingViewerResponse = {
  showInRanking: boolean;
  nickname: string;
  rank: number | null;
  score: number | null;
  status: RankingViewerStatus;
};

@Injectable()
export class RankingViewerProjector {
  project(
    preferences: RankingUserPreferences | null,
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
