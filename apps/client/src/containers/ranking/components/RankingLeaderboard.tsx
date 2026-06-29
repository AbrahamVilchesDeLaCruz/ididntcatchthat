import { type ReactElement } from 'react';
import { useI18n } from '@/core/i18n';
import { UserAvatar } from '@/common/components/UserAvatar';
import { Badge } from '@/common/components/ui/badge';
import { formatRankingScore } from '../ranking.mapper';
import type { RankingEntryVM, RankingType } from '../ranking.types';
import { RankingPodium } from './RankingPodium';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/common/components/ui/table';

interface RankingLeaderboardProps {
  type: RankingType;
  entries: RankingEntryVM[];
  isFetching: boolean;
}

export const RankingLeaderboard = ({
  type,
  entries,
  isFetching,
}: RankingLeaderboardProps): ReactElement => {
  const { t } = useI18n();
  const r = t.ranking;
  const scoreLabel = r.scoreUnits[type];

  if (entries.length === 0) {
    return (
      <div className="py-16 px-6 text-center text-[var(--color-text-secondary)] space-y-2">
        <p>{r.empty}</p>
      </div>
    );
  }

  const rest = entries.filter((entry) => entry.rank > 3);

  return (
    <div
      className={[
        'transition-opacity duration-200',
        isFetching ? 'opacity-60' : 'opacity-100',
      ].join(' ')}
    >
      <RankingPodium type={type} entries={entries} />

      {rest.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">{r.table.rank}</TableHead>
              <TableHead>{r.table.player}</TableHead>
              <TableHead className="text-right">{r.table.score}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rest.map((entry) => (
              <TableRow
                key={`${entry.userId}-${entry.rank}`}
                className={
                  entry.isMe
                    ? 'bg-[var(--color-brand)]/10 hover:bg-[var(--color-brand)]/15'
                    : undefined
                }
              >
                <TableCell className="font-medium">{entry.rank}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <UserAvatar nickname={entry.nickname} className="size-8" />
                    <div className="min-w-0">
                      <span className="font-medium text-[var(--color-text-primary)]">
                        {entry.nickname}
                      </span>
                      {entry.isMe ? (
                        <Badge className="ml-2 bg-[var(--color-brand)] text-white">
                          {r.table.you}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatRankingScore(type, entry.score)}
                  <span className="ml-1 text-xs text-[var(--color-text-muted)]">
                    {scoreLabel}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </div>
  );
};
