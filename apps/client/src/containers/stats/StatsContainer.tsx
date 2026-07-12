import { type ReactElement, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/core/store/auth.store';
import { useStartGame } from '@/containers/game/api/game.api';
import { useStatsState } from './hooks';
import { StatsComponent } from './StatsComponent';
import { GuestStatsPanel } from './components/GuestStatsPanel';
import { StatsSectionSkeleton } from './components/StatsSectionSkeleton';
import { useI18n } from '@/core/i18n';

const WEAKEST_PAGE_SIZE = 10;

export const StatsContainer = (): ReactElement => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useI18n();
  const userType = useAuthStore((s) => s.userType);
  const isGuest = userType === 'guest';

  const selectedCategory = searchParams.get('category');
  const weakPageParam = Number(searchParams.get('weakPage') ?? '1');
  const weakPage =
    Number.isFinite(weakPageParam) && weakPageParam >= 1
      ? Math.floor(weakPageParam)
      : 1;

  const {
    moduleProgress,
    subcategoryProgress,
    weakestFlashcards,
    progressSummary,
  } = useStatsState({
    enabled: !isGuest,
    weakestPage: weakPage,
    weakestPageSize: WEAKEST_PAGE_SIZE,
  });

  const { mutate: startGame, isPending: isStartingWeakest } = useStartGame();

  const setSelectedCategory = useCallback(
    (category: string | null): void => {
      if (category) {
        setSearchParams({ category });
      } else {
        setSearchParams({});
      }
    },
    [setSearchParams],
  );

  const setWeakPage = useCallback(
    (page: number): void => {
      const next = new URLSearchParams(searchParams);
      if (page <= 1) {
        next.delete('weakPage');
      } else {
        next.set('weakPage', String(page));
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  useEffect(() => {
    const param = searchParams.get('category');
    if (param && moduleProgress.data && moduleProgress.data.length > 0) {
      const exists = moduleProgress.data.some((m) => m.module === param);
      if (!exists) {
        setSearchParams({});
      }
    }
  }, [moduleProgress.data, searchParams, setSearchParams]);

  const handlePractice = useCallback(
    (module: string, subcategory: string | null): void => {
      if (isGuest) {
        void navigate('/auth/login');
        return;
      }
      void navigate('/game', {
        state: {
          prefillModule: module,
          prefillSubcategory: subcategory,
        },
      });
    },
    [isGuest, navigate],
  );

  const handlePracticeWeakest = useCallback((): void => {
    if (isGuest) {
      void navigate('/auth/register');
      return;
    }
    startGame(
      { mode: 'game', module: null, cardCount: 10, source: 'weakest' },
      {
        onSuccess: ({ gameId, flashcardIds }) => {
          void navigate(`/game/${gameId}`, {
            state: { flashcardIds },
          });
        },
      },
    );
  }, [isGuest, navigate, startGame]);

  const modules = moduleProgress.data ?? [];
  const subcategories = subcategoryProgress.data ?? [];
  const weakFlashcards = useMemo(
    () => weakestFlashcards.data ?? [],
    [weakestFlashcards.data],
  );

  if (isGuest) {
    return (
      <GuestStatsPanel onRegister={() => void navigate('/auth/register')} />
    );
  }

  const isInitialLoading =
    moduleProgress.isLoading &&
    subcategoryProgress.isLoading &&
    weakestFlashcards.isLoading &&
    progressSummary.isLoading;

  if (isInitialLoading) {
    return (
      <div className="space-y-8">
        <StatsSectionSkeleton height="h-8" />
        <StatsSectionSkeleton height="h-24" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatsSectionSkeleton />
          <StatsSectionSkeleton />
        </div>
      </div>
    );
  }

  return (
    <StatsComponent
      summary={progressSummary.data ?? null}
      summaryLoading={progressSummary.isLoading || isStartingWeakest}
      summaryError={progressSummary.isError}
      modules={modules}
      subcategories={subcategories}
      weakFlashcards={weakFlashcards}
      weakPagination={weakestFlashcards.pagination ?? null}
      selectedCategory={selectedCategory}
      moduleLoading={moduleProgress.isLoading}
      moduleError={moduleProgress.isError}
      subcategoryLoading={subcategoryProgress.isLoading}
      subcategoryError={subcategoryProgress.isError}
      weakLoading={weakestFlashcards.isLoading}
      weakError={weakestFlashcards.isError}
      isGuest={isGuest}
      onCategorySelect={setSelectedCategory}
      onCategoryClear={() => setSelectedCategory(null)}
      onRetryModules={() => void moduleProgress.refetch()}
      onRetrySubcategories={() => void subcategoryProgress.refetch()}
      onRetryWeak={() => void weakestFlashcards.refetch()}
      onRetrySummary={() => void progressSummary.refetch()}
      onPractice={handlePractice}
      onPracticeWeakest={handlePracticeWeakest}
      onWeakPageChange={setWeakPage}
      onGuestRegister={() => void navigate('/auth/register')}
      emptyGlobalCta={() => void navigate('/game')}
      loadErrorLabel={t.stats.loadError}
      retryLabel={t.stats.retry}
    />
  );
};
