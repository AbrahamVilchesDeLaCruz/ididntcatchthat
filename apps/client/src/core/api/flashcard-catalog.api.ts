import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/core/api/apiClient';
import type { ApiEnvelope } from '@/core/api/api-envelope';
import type { FlashcardCatalogApiModel } from '@/core/api/flashcard-catalog.api-model';

export const flashcardCatalogKeys = {
  all: ['flashcard-catalog'] as const,
  catalog: () => [...flashcardCatalogKeys.all, 'catalog'] as const,
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useFlashcardCatalog = () => {
  return useQuery({
    queryKey: flashcardCatalogKeys.catalog(),
    queryFn: async (): Promise<FlashcardCatalogApiModel> => {
      const res = await apiClient.get<ApiEnvelope<FlashcardCatalogApiModel>>(
        '/flashcards/catalog',
      );
      return res.data.data;
    },
    staleTime: Infinity,
  });
};
