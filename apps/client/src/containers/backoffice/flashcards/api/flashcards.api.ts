import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/core/api/apiClient';
import { mapFlashcard, mapFlashcardsPage } from '../flashcards.mapper';
import type {
  CreateFlashcardApiPayload,
  FlashcardApiModel,
  FlashcardsListApiModel,
  SearchFlashcardsParams,
  UpdateFlashcardApiPayload,
} from './flashcards.api-model';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const flashcardKeys = {
  all: ['backoffice', 'flashcards'] as const,
  lists: () => [...flashcardKeys.all, 'list'] as const,
  list: (params: SearchFlashcardsParams) =>
    [...flashcardKeys.lists(), params] as const,
  detail: (id: string) => [...flashcardKeys.all, 'detail', id] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────
export const useFlashcards = (
  params: SearchFlashcardsParams = {},
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
) => {
  return useQuery({
    queryKey: flashcardKeys.list(params),
    queryFn: () =>
      apiClient
        .get<FlashcardsListApiModel>('/flashcards', { params })
        .then((res) => res.data),
    select: mapFlashcardsPage,
  });
};

export const useFlashcard = (
  id: string,
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
) => {
  return useQuery({
    queryKey: flashcardKeys.detail(id),
    queryFn: () =>
      apiClient
        .get<FlashcardApiModel>(`/flashcards/${id}`)
        .then((res) => res.data),
    select: mapFlashcard,
    enabled: !!id,
  });
};

// ─── Mutations ────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useCreateFlashcard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFlashcardApiPayload): Promise<void> =>
      apiClient.post<void>('/flashcards', payload).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: flashcardKeys.lists() });
    },
  });
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useUpdateFlashcard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateFlashcardApiPayload;
    }) =>
      apiClient
        .patch<FlashcardApiModel>(`/flashcards/${id}`, data)
        .then((res) => res.data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: flashcardKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: flashcardKeys.detail(id),
      });
    },
  });
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useDeleteFlashcard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string): Promise<void> =>
      apiClient.delete<void>(`/flashcards/${id}`).then((res) => res.data),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: flashcardKeys.lists() });
      queryClient.removeQueries({ queryKey: flashcardKeys.detail(id) });
    },
  });
};
