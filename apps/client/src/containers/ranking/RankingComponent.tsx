import { type ReactElement } from 'react';
import { useI18n } from '@/core/i18n';
import { RankingFilters } from './components/RankingFilters';
import { RankingLeaderboard } from './components/RankingLeaderboard';
import { RankingProfileCard } from './components/RankingProfileCard';
import { formatRankingScore } from './ranking.mapper';
import type {
  RankingEntryVM,
  RankingModule,
  RankingPeriod,
  RankingProfileVM,
  RankingType,
} from './ranking.types';

interface RankingComponentProps {
  type: RankingType;
  period: RankingPeriod;
  module: RankingModule;
  profile: RankingProfileVM;
  entries: RankingEntryVM[];
  currentUser: RankingEntryVM | null;
  isProfileLoading: boolean;
  isRankingsLoading: boolean;
  isRankingsFetching: boolean;
  isSavingProfile: boolean;
  profileSaveStatus: 'idle' | 'success' | 'error';
  onTypeChange: (type: RankingType) => void;
  onPeriodChange: (period: RankingPeriod) => void;
  onModuleChange: (module: RankingModule) => void;
  onProfileChange: (profile: RankingProfileVM) => void;
  onSaveProfile: () => void;
}

export const RankingComponent = ({
  type,
  period,
  module,
  profile,
  entries,
  currentUser,
  isProfileLoading,
  isRankingsLoading,
  isRankingsFetching,
  isSavingProfile,
  profileSaveStatus,
  onTypeChange,
  onPeriodChange,
  onModuleChange,
  onProfileChange,
  onSaveProfile,
}: RankingComponentProps): ReactElement => {
  const { t } = useI18n();
  const r = t.ranking;
  const showOutsideTopBanner =
    profile.showInRanking &&
    currentUser !== null &&
    !entries.some((e) => e.userId === currentUser.userId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          {r.title}
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm mt-1">
          {r.subtitle}
        </p>
      </div>

      <RankingProfileCard
        profile={profile}
        isLoading={isProfileLoading}
        isSaving={isSavingProfile}
        saveStatus={profileSaveStatus}
        onProfileChange={onProfileChange}
        onSaveProfile={onSaveProfile}
      />

      <RankingFilters
        type={type}
        period={period}
        module={module}
        onTypeChange={onTypeChange}
        onPeriodChange={onPeriodChange}
        onModuleChange={onModuleChange}
      />

      <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] overflow-hidden">
        {isRankingsLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-brand)] border-t-transparent" />
            <span className="ml-3 text-sm text-[var(--color-text-secondary)]">
              {r.loading}
            </span>
          </div>
        ) : entries.length === 0 ? (
          <div className="py-16 px-6 text-center text-[var(--color-text-secondary)] space-y-2">
            <p>{r.empty}</p>
            {!profile.showInRanking && (
              <p className="text-xs">{r.emptyOptInHint}</p>
            )}
            {profile.showInRanking && type === 'most_active' && (
              <p className="text-xs">{r.emptyMostActiveHint}</p>
            )}
          </div>
        ) : (
          <RankingLeaderboard
            type={type}
            entries={entries}
            currentUser={currentUser}
            isFetching={isRankingsFetching}
          />
        )}
      </div>

      {showOutsideTopBanner && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-[var(--color-text-secondary)]">
          {r.outsideTopHint}
        </div>
      )}

      {currentUser && (
        <div className="rounded-xl border border-[var(--color-brand)]/40 bg-[var(--color-brand)]/10 px-4 py-3 text-sm flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-semibold text-[var(--color-text-primary)]">
            {r.yourPosition}: #{currentUser.rank}
          </span>
          <span className="text-[var(--color-text-secondary)]">
            {formatRankingScore(type, currentUser.score)} {r.scoreUnits[type]}
          </span>
        </div>
      )}
    </div>
  );
};
