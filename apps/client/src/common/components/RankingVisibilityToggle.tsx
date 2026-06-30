import { type ReactElement } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useI18n } from '@/core/i18n';
import { cn } from '@/common/lib/utils';

interface RankingVisibilityToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const RankingVisibilityToggle = ({
  checked,
  onCheckedChange,
}: RankingVisibilityToggleProps): ReactElement => {
  const { t } = useI18n();
  const labels = t.profileMenu;
  const hiddenLabel = t.profile.hero.hiddenInRanking;

  return (
    <div className="flex shrink-0 items-center gap-1 rounded-lg border border-[var(--color-border)] px-1 py-1">
      <button
        type="button"
        aria-label={hiddenLabel}
        aria-pressed={!checked}
        onClick={() => onCheckedChange(false)}
        className={cn(
          'flex flex-1 items-center justify-center rounded-md p-1.5 transition-colors',
          !checked
            ? 'bg-[var(--color-brand)] text-white'
            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]',
        )}
      >
        <EyeOff className="h-3.5 w-3.5" aria-hidden />
      </button>
      <button
        type="button"
        aria-label={labels.showInRankingLabel}
        aria-pressed={checked}
        onClick={() => onCheckedChange(true)}
        className={cn(
          'flex flex-1 items-center justify-center rounded-md p-1.5 transition-colors',
          checked
            ? 'bg-[var(--color-brand)] text-white'
            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]',
        )}
      >
        <Eye className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
};
