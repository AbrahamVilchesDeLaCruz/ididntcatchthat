import { Inject, Injectable } from '@nestjs/common';
import { type WeakestFlashcardIdsProvider } from '@/gaming/domain/weakest-flashcard-ids.provider';
import {
  type WeakestFlashcardQuery,
  WEAKEST_FLASHCARD_QUERY,
} from '@/progress/domain/weakest-flashcard.query';
import { UserId } from '@/shared/domain/user-id';

@Injectable()
export class ProgressWeakestFlashcardIdsProvider implements WeakestFlashcardIdsProvider {
  constructor(
    @Inject(WEAKEST_FLASHCARD_QUERY)
    private readonly query: WeakestFlashcardQuery,
  ) {}

  async findWeakestIds(
    userId: string,
    limit: number,
    module: string | null,
    subcategory: string | null,
  ): Promise<string[]> {
    const filters =
      module || subcategory
        ? {
            ...(module ? { module } : {}),
            ...(subcategory ? { subcategory } : {}),
          }
        : undefined;

    const cards = await this.query.findWeakest(
      new UserId(userId),
      limit,
      filters,
    );
    return cards.map((c) => c.flashcardId);
  }
}
