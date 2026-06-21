import { type ReactElement } from 'react';
import { useI18n } from '@/core/i18n';
import { useRankingState } from './hooks';
import { RankingComponent } from './RankingComponent';

export const RankingContainer = (): ReactElement => {
  const { t } = useI18n();
  const {
    type,
    setType,
    period,
    setPeriod,
    module,
    setModule,
    profile,
    setProfile,
    profileQuery,
    rankingsQuery,
    updateProfile,
    profileSaveStatus,
  } = useRankingState();

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
      profile={profile}
      entries={rankingsQuery.data?.entries ?? []}
      currentUser={rankingsQuery.data?.currentUser ?? null}
      isProfileLoading={profileQuery.isLoading}
      isRankingsLoading={rankingsQuery.isLoading}
      isRankingsFetching={rankingsQuery.isFetching}
      isSavingProfile={updateProfile.isPending}
      profileSaveStatus={profileSaveStatus}
      onTypeChange={setType}
      onPeriodChange={setPeriod}
      onModuleChange={setModule}
      onProfileChange={setProfile}
      onSaveProfile={() => {
        updateProfile.mutate(profile);
      }}
    />
  );
};
