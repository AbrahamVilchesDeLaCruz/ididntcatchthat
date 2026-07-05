import { type ReactElement } from 'react';
import { useI18n } from '@/core/i18n';
import { useRankingState } from './hooks';
import { RankingComponent } from './RankingComponent';

export const RankingContainer = (): ReactElement => {
  const { t } = useI18n();
  const { type, setType, period, setPeriod, module, setModule, rankingsQuery } =
    useRankingState();

  if (rankingsQuery.isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <p className="text-[var(--color-accent-red)]">{t.ranking.error}</p>
        <button
          type="button"
          onClick={() => {
            void rankingsQuery.refetch();
          }}
          className="rounded-full bg-[var(--color-brand)] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          {t.ranking.retry}
        </button>
      </div>
    );
  }

  return (
    <RankingComponent
      type={type}
      period={period}
      module={module}
      entries={rankingsQuery.data?.entries ?? []}
      currentUser={rankingsQuery.data?.currentUser ?? null}
      viewer={
        rankingsQuery.data?.viewer ?? {
          showInRanking: false,
          nickname: '',
          rank: null,
          score: null,
          status: 'hidden',
        }
      }
      isRankingsLoading={rankingsQuery.isLoading}
      isRankingsFetching={rankingsQuery.isFetching}
      onTypeChange={setType}
      onPeriodChange={setPeriod}
      onModuleChange={setModule}
    />
  );
};
