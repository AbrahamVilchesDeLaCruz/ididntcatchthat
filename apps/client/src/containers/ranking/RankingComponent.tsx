import { type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/core/i18n';
import { Button } from '@/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/common/components/ui/card';
import { RankingFilters } from './components/RankingFilters';
import { RankingLeaderboard } from './components/RankingLeaderboard';
import { formatRankingScore } from './ranking.mapper';
import type {
  RankingEntryVM,
  RankingModule,
  RankingPeriod,
  RankingType,
  RankingViewerVM,
} from './ranking.types';

interface RankingComponentProps {
  type: RankingType;
  period: RankingPeriod;
  module: RankingModule;
  entries: RankingEntryVM[];
  currentUser: Omit<RankingEntryVM, 'isMe'> | null;
  viewer: RankingViewerVM;
  isRankingsLoading: boolean;
  isRankingsFetching: boolean;
  onTypeChange: (type: RankingType) => void;
  onPeriodChange: (period: RankingPeriod) => void;
  onModuleChange: (module: RankingModule) => void;
}

export const RankingComponent = ({
  type,
  period,
  module,
  entries,
  currentUser,
  viewer,
  isRankingsLoading,
  isRankingsFetching,
  onTypeChange,
  onPeriodChange,
  onModuleChange,
}: RankingComponentProps): ReactElement => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const r = t.ranking;

  const isRankedInList = entries.some((entry) => entry.isMe);
  const showOutsideTopBanner =
    viewer.status === 'ranked' && currentUser !== null && !isRankedInList;

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

      {viewer.status === 'hidden' ? (
        <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <CardHeader>
            <CardTitle>{r.viewer.hiddenTitle}</CardTitle>
            <CardDescription>{r.viewer.hiddenDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" onClick={() => void navigate('/profile')}>
              {r.viewer.hiddenAction}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {viewer.status === 'visible_unranked' ? (
        <Card className="border-[var(--color-brand)]/30 bg-[var(--color-brand)]/8">
          <CardHeader>
            <CardTitle>{r.viewer.visibleUnrankedTitle}</CardTitle>
            <CardDescription>
              {r.viewer.visibleUnrankedDescription}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

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
            {type === 'most_active' ? (
              <p className="text-xs">{r.emptyMostActiveHint}</p>
            ) : null}
          </div>
        ) : (
          <RankingLeaderboard
            type={type}
            entries={entries}
            isFetching={isRankingsFetching}
          />
        )}
      </div>

      {showOutsideTopBanner && currentUser ? (
        <Card className="border-yellow-500/30 bg-yellow-500/10">
          <CardHeader>
            <CardTitle>{r.viewer.rankedOutsideTitle}</CardTitle>
            <CardDescription>{r.outsideTopHint}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span className="font-semibold text-[var(--color-text-primary)]">
              {r.yourPosition}: #{currentUser.rank}
            </span>
            <span className="text-[var(--color-text-secondary)]">
              {formatRankingScore(type, currentUser.score)} {r.scoreUnits[type]}
            </span>
          </CardContent>
        </Card>
      ) : null}

      {viewer.status === 'ranked' && isRankedInList && currentUser ? (
        <Card className="border-[var(--color-brand)]/40 bg-[var(--color-brand)]/10">
          <CardContent className="flex flex-wrap items-center gap-x-2 gap-y-1 py-4 text-sm">
            <span className="font-semibold text-[var(--color-text-primary)]">
              {r.yourPosition}: #{currentUser.rank}
            </span>
            <span className="text-[var(--color-text-secondary)]">
              {formatRankingScore(type, currentUser.score)} {r.scoreUnits[type]}
            </span>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};
