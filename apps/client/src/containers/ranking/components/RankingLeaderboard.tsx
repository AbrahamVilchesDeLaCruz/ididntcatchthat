import { type ReactElement } from 'react';
import { useI18n } from '@/core/i18n';
import {
  formatRankingScore,
  getMedalEmoji,
  isCurrentUser,
} from '../ranking.mapper';
import type { RankingEntryVM, RankingType } from '../ranking.types';
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
  currentUser: RankingEntryVM | null;
  isFetching: boolean;
}

export const RankingLeaderboard = ({
  type,
  entries,
  currentUser,
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

  const podium = entries
    .filter((e) => e.rank <= 3)
    .sort((a, b) => a.rank - b.rank);
  const rest = entries.filter((e) => e.rank > 3);

  return (
    <div
      className={[
        'transition-opacity duration-200',
        isFetching ? 'opacity-60' : 'opacity-100',
      ].join(' ')}
    >
      {podium.length > 0 && (
        <div className="grid grid-cols-3 gap-3 border-b border-[var(--color-border)] bg-white/[0.02] px-4 py-6">
          {podium.map((entry) => {
            const highlighted = isCurrentUser(entry, currentUser);
            return (
              <div
                key={entry.userId}
                className={[
                  'flex flex-col items-center gap-1 rounded-xl p-3 text-center',
                  highlighted
                    ? 'bg-[var(--color-brand)]/15 ring-1 ring-[var(--color-brand)]/40'
                    : 'bg-[var(--color-bg-base)]/50',
                ].join(' ')}
              >
                <span className="text-2xl">
                  {getMedalEmoji(entry.rank) ?? `#${entry.rank}`}
                </span>
                <span className="text-sm font-semibold text-[var(--color-text-primary)] truncate max-w-full">
                  {entry.nickname}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {formatRankingScore(type, entry.score)} {scoreLabel}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">{r.table.rank}</TableHead>
            <TableHead>{r.table.player}</TableHead>
            <TableHead className="text-right">{r.table.score}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rest.map((entry) => {
            const highlighted = isCurrentUser(entry, currentUser);
            return (
              <TableRow
                key={`${entry.userId}-${entry.rank}`}
                className={
                  highlighted
                    ? 'bg-[var(--color-brand)]/10 hover:bg-[var(--color-brand)]/15'
                    : undefined
                }
              >
                <TableCell className="font-medium">{entry.rank}</TableCell>
                <TableCell>
                  <span className="font-medium text-[var(--color-text-primary)]">
                    {entry.nickname}
                  </span>
                  {highlighted && (
                    <span className="ml-2 text-xs text-[var(--color-brand-light)]">
                      {t.ranking.table.you}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatRankingScore(type, entry.score)}
                  <span className="ml-1 text-xs text-[var(--color-text-muted)]">
                    {scoreLabel}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
