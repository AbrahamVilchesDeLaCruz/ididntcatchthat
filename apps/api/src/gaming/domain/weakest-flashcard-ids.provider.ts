export interface WeakestFlashcardIdsProvider {
  findWeakestIds(
    userId: string,
    limit: number,
    module: string | null,
    subcategory: string | null,
  ): Promise<string[]>;
}

export const WEAKEST_FLASHCARD_IDS_PROVIDER = Symbol(
  'WeakestFlashcardIdsProvider',
);
