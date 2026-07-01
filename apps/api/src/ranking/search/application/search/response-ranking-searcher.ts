import { type RankingEntryPrimitives } from '@/ranking/search/domain/ranking-entry';
import { type RankingViewerResponse } from '@/ranking/search/domain/ranking-viewer-projector';

export type RankingEntryResponse = RankingEntryPrimitives & {
  isMe: boolean;
};

export type ResponseRankingSearcherPrimitives = {
  entries: RankingEntryResponse[];
  currentUser: RankingEntryPrimitives | null;
  viewer: RankingViewerResponse;
};

export class ResponseRankingSearcher {
  private constructor(
    readonly entries: RankingEntryResponse[],
    readonly currentUser: RankingEntryPrimitives | null,
    readonly viewer: RankingViewerResponse,
  ) {}

  static fromParts(
    parts: ResponseRankingSearcherPrimitives,
  ): ResponseRankingSearcher {
    return new ResponseRankingSearcher(
      parts.entries,
      parts.currentUser,
      parts.viewer,
    );
  }

  toResponse(): ResponseRankingSearcherPrimitives {
    return {
      entries: this.entries,
      currentUser: this.currentUser,
      viewer: this.viewer,
    };
  }
}
