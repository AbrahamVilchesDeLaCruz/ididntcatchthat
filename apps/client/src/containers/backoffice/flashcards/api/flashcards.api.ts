import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiEnvelope } from '@/core/api/api-envelope';
import { apiClient } from '@/core/api/apiClient';
import { ApiRequestError } from '@/core/api/apiError';
import { useFlashcardCatalog as useFlashcardCatalogCore } from '@/core/api/flashcard-catalog.api';
import { mapFlashcard, mapFlashcardsPage } from '../flashcards.mapper';
import type { FlashcardsPageVM } from '../flashcards.types';
import type {
  BulkCreateFlashcardApiPayload,
  CreateFlashcardApiPayload,
  FlashcardApiModel,
  FlashcardDraftApiModel,
  FlashcardsListApiModel,
  SearchFlashcardsParams,
  UpdateFlashcardApiPayload,
  GenerateFlashcardsApiPayload,
  GenerateFlashcardsApiResult,
  RegenerateFlashcardAudioBulkApiPayload,
  RegenerateFlashcardAudioBulkApiResult,
} from './flashcards.api-model';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const flashcardKeys = {
  all: ['backoffice', 'flashcards'] as const,
  lists: () => [...flashcardKeys.all, 'list'] as const,
  list: (params: SearchFlashcardsParams) =>
    [...flashcardKeys.lists(), params] as const,
  detail: (id: string) => [...flashcardKeys.all, 'detail', id] as const,
  catalog: () => [...flashcardKeys.all, 'catalog'] as const,
};

const FLASHCARDS_POLL_INTERVAL_MS = 8_000;

const shouldRetryFlashcardsQuery = (
  failureCount: number,
  error: Error,
): boolean => {
  if (error instanceof ApiRequestError && error.status === 429) {
    return false;
  }
  return failureCount < 1;
};

export { useFlashcardCatalogCore as useFlashcardCatalog };

// ─── Queries ──────────────────────────────────────────────────────────────────
export const useFlashcards = (
  params: SearchFlashcardsParams = {},
  options?: { enabled?: boolean },
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
) => {
  return useQuery<FlashcardsListApiModel, Error, FlashcardsPageVM>({
    queryKey: flashcardKeys.list(params),
    queryFn: (): Promise<FlashcardsListApiModel> =>
      apiClient
        .get<FlashcardsListApiModel>('/flashcards', { params })
        .then((res) => res.data),
    select: mapFlashcardsPage,
    enabled: options?.enabled ?? true,
    retry: shouldRetryFlashcardsQuery,
    refetchIntervalInBackground: false,
    refetchInterval: (query) => {
      const raw = query.state.data;
      const needsPolling = raw?.data?.some(
        (f) => f.audioStatus === 'pending' || f.audioStatus === 'generating',
      );
      return needsPolling ? FLASHCARDS_POLL_INTERVAL_MS : false;
    },
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
        .get<ApiEnvelope<FlashcardApiModel>>(`/flashcards/${id}`)
        .then((res) => res.data.data),
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
    }): Promise<void> =>
      apiClient.patch<void>(`/flashcards/${id}`, data).then((res) => res.data),
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

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useRegenerateFlashcardAudio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string): Promise<void> =>
      apiClient
        .post<void>(`/flashcards/${id}/audio/regenerates`)
        .then((res) => res.data),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: flashcardKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: flashcardKeys.detail(id),
      });
    },
  });
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useRegenerateFlashcardAudioBulk = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: RegenerateFlashcardAudioBulkApiPayload,
    ): Promise<RegenerateFlashcardAudioBulkApiResult> =>
      apiClient
        .post<
          ApiEnvelope<RegenerateFlashcardAudioBulkApiResult>
        >('/flashcards/audio/regenerates', payload)
        .then((res) => res.data.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: flashcardKeys.lists() });
    },
  });
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useBulkCreateFlashcards = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkCreateFlashcardApiPayload): Promise<void> =>
      apiClient.post<void>('/flashcards/bulk', payload).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: flashcardKeys.lists() });
    },
  });
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useGenerateFlashcards = () => {
  return useMutation({
    mutationFn: (
      payload: GenerateFlashcardsApiPayload,
    ): Promise<FlashcardDraftApiModel[]> =>
      apiClient
        .post<
          ApiEnvelope<GenerateFlashcardsApiResult>
        >('/flashcards/drafts', payload)
        .then((res) => res.data.data.drafts),
  });
};
