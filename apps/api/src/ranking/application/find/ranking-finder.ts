import { Inject, Injectable } from '@nestjs/common';
import { RankingKey } from '@/ranking/domain/ranking-key';
import {
  type RankingSelector,
  RANKING_SELECTOR,
} from '@/ranking/domain/ranking-selector';
import { type RankingEntryPrimitives } from '@/ranking/domain/ranking-entry';

export type RequestRankingFinder = {
  userId: string;
  type: string;
  period: string;
  module?: string;
  limit?: number;
};

export type RankingFinderResult = {
  entries: RankingEntryPrimitives[];
  currentUser: RankingEntryPrimitives | null;
};

@Injectable()
export class RankingFinder {
  constructor(
    @Inject(RANKING_SELECTOR)
    private readonly selector: RankingSelector,
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

    return { entries: entryPrimitives, currentUser };
  }
}
