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
      <div className="text-[var(--color-accent-red)] text-center py-16">
        {t.ranking.error}
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
