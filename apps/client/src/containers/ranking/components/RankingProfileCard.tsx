import { type ReactElement } from 'react';
import { useI18n } from '@/core/i18n';
import type { RankingProfileVM } from '../ranking.types';

interface RankingProfileCardProps {
  profile: RankingProfileVM;
  isLoading: boolean;
  isSaving: boolean;
  saveStatus: 'idle' | 'success' | 'error';
  onProfileChange: (profile: RankingProfileVM) => void;
  onSaveProfile: () => void;
}

export const RankingProfileCard = ({
  profile,
  isLoading,
  isSaving,
  saveStatus,
  onProfileChange,
  onSaveProfile,
}: RankingProfileCardProps): ReactElement => {
  const { t } = useI18n();
  const r = t.ranking.profile;

  if (isLoading) {
    return (
      <div className="bg-[var(--color-bg-card)] rounded-xl p-6 border border-[var(--color-border)] flex items-center justify-center min-h-[140px]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-brand)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg-card)] rounded-xl p-6 border border-[var(--color-border)] space-y-4">
      <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
        {t.ranking.profile.title}
      </h2>
      <label className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
        <input
          type="checkbox"
          checked={profile.showInRanking}
          onChange={(event) =>
            onProfileChange({
              ...profile,
              showInRanking: event.target.checked,
            })
          }
        />
        {r.showNickname}
      </label>
      <input
        className="w-full max-w-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-base)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
        value={profile.nickname}
        onChange={(event) =>
          onProfileChange({ ...profile, nickname: event.target.value })
        }
        placeholder={r.nicknamePlaceholder}
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSaveProfile}
          disabled={isSaving}
          className="rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60 transition-opacity hover:opacity-90"
        >
          {isSaving ? r.saving : r.save}
        </button>
        {saveStatus === 'success' && (
          <span className="text-sm text-[var(--color-accent-green)]">
            {r.saved}
          </span>
        )}
        {saveStatus === 'error' && (
          <span className="text-sm text-[var(--color-accent-red)]">
            {r.saveError}
          </span>
        )}
      </div>
    </div>
  );
};
