import { type ReactElement } from 'react';
import { Medal, Trophy } from 'lucide-react';
import { useI18n } from '@/core/i18n';
import { UserAvatar } from '@/common/components/UserAvatar';
import { Badge } from '@/common/components/ui/badge';
import { formatRankingScore } from '../ranking.mapper';
import type { RankingEntryVM, RankingType } from '../ranking.types';
import '../ranking-ui.css';

interface RankingPodiumProps {
  type: RankingType;
  entries: RankingEntryVM[];
}

const podiumOrder = (entries: RankingEntryVM[]): RankingEntryVM[] => {
  const byRank = new Map(entries.map((entry) => [entry.rank, entry]));
  return [byRank.get(2), byRank.get(1), byRank.get(3)].filter(
    (entry): entry is RankingEntryVM => entry !== undefined,
  );
};

const PodiumIcon = ({ rank }: { rank: number }): ReactElement => {
  if (rank === 1) {
    return (
      <Trophy className="size-7 text-[var(--color-brand-light)]" aria-hidden />
    );
  }

  return (
    <Medal
      className={[
        'size-6',
        rank === 2
          ? 'text-[var(--color-text-secondary)]'
          : 'text-[var(--color-accent-green)]',
      ].join(' ')}
      aria-hidden
    />
  );
};

const PodiumSlot = ({
  entry,
  type,
  label,
  elevationClass,
  slotClass,
}: {
  entry: RankingEntryVM;
  type: RankingType;
  label: string;
  elevationClass: string;
  slotClass: string;
}): ReactElement => {
  const { t } = useI18n();
  const scoreLabel = t.ranking.scoreUnits[type];

  return (
    <div
      className={[
        'ranking-podium-slot flex flex-col items-center gap-2 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 pb-4 pt-3 text-center',
        elevationClass,
        slotClass,
        entry.isMe
          ? 'ranking-podium-slot--me ring-1 ring-[var(--color-brand)]/40'
          : '',
      ].join(' ')}
    >
      <PodiumIcon rank={entry.rank} />
      <span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
        {label}
      </span>
      <UserAvatar nickname={entry.nickname} className="size-12" />
      <div className="min-w-0 space-y-1">
        <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
          {entry.nickname}
        </p>
        {entry.isMe ? (
          <Badge className="bg-[var(--color-brand)] text-white">
            {t.ranking.table.you}
          </Badge>
        ) : null}
        <p className="text-xs text-[var(--color-text-muted)]">
          {formatRankingScore(type, entry.score)} {scoreLabel}
        </p>
      </div>
    </div>
  );
};

export const RankingPodium = ({
  type,
  entries,
}: RankingPodiumProps): ReactElement | null => {
  const { t } = useI18n();
  const ordered = podiumOrder(entries.filter((entry) => entry.rank <= 3));

  if (ordered.length === 0) {
    return null;
  }

  const slotByRank = Object.fromEntries(
    ordered.map((entry) => [entry.rank, entry]),
  ) as Partial<Record<1 | 2 | 3, RankingEntryVM>>;

  return (
    <div className="ranking-podium-stage border-b border-[var(--color-border)] px-4 py-8">
      <div className="mx-auto grid max-w-4xl grid-cols-3 items-end gap-3">
        {slotByRank[2] ? (
          <PodiumSlot
            entry={slotByRank[2]}
            type={type}
            label={t.ranking.podium.second}
            elevationClass="min-h-[220px] justify-end"
            slotClass="ranking-podium-slot--second"
          />
        ) : (
          <div />
        )}
        {slotByRank[1] ? (
          <PodiumSlot
            entry={slotByRank[1]}
            type={type}
            label={t.ranking.podium.first}
            elevationClass="min-h-[260px] justify-end -translate-y-2"
            slotClass="ranking-podium-slot--first"
          />
        ) : (
          <div />
        )}
        {slotByRank[3] ? (
          <PodiumSlot
            entry={slotByRank[3]}
            type={type}
            label={t.ranking.podium.third}
            elevationClass="min-h-[200px] justify-end"
            slotClass="ranking-podium-slot--third"
          />
        ) : (
          <div />
        )}
      </div>
    </div>
  );
};
