import { type ReactElement, useState } from 'react';
import { useI18n } from '@/core/i18n';
import {
  useRankingProfile,
  useUpdateRankingProfile,
} from '@/core/profile/useRankingProfile';
import type { RankingProfileVM } from '@/containers/ranking/ranking.types';
import { UserAvatar } from '@/common/components/UserAvatar';
import { Button } from '@/common/components/ui/button';
import { Switch } from '@/common/components/ui/switch';

const defaultProfile = (): RankingProfileVM => ({
  showInRanking: false,
  nickname: '',
});

export const ProfileRankingSection = (): ReactElement => {
  const { t } = useI18n();
  const labels = t.profileMenu;
  const profileQuery = useRankingProfile();
  const savedProfile = profileQuery.data ?? defaultProfile();
  const [draft, setDraft] = useState<RankingProfileVM | null>(null);
  const form = draft ?? savedProfile;
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>(
    'idle',
  );

  const updateProfile = useUpdateRankingProfile({
    onSuccess: () => {
      setDraft(null);
      setSaveStatus('success');
      window.setTimeout(() => setSaveStatus('idle'), 3000);
    },
    onError: () => {
      setSaveStatus('error');
      window.setTimeout(() => setSaveStatus('idle'), 4000);
    },
  });

  return (
    <section
      id="ranking"
      className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6"
    >
      <h2 className="mb-1 text-lg font-semibold text-[var(--color-text-primary)]">
        {labels.title}
      </h2>
      <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
        {labels.description}
      </p>

      <div className="flex flex-col items-center gap-3 py-2">
        <UserAvatar nickname={form.nickname} className="size-20" />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="profile-nickname"
            className="text-sm font-medium text-[var(--color-text-primary)]"
          >
            {labels.nicknameLabel}
          </label>
          <input
            id="profile-nickname"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-base)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
            value={form.nickname}
            minLength={3}
            maxLength={30}
            onChange={(event) =>
              setDraft({ ...form, nickname: event.target.value })
            }
            placeholder={labels.nicknamePlaceholder}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              {labels.showInRankingLabel}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {labels.showInRankingHint}
            </p>
          </div>
          <Switch
            checked={form.showInRanking}
            onCheckedChange={(checked) =>
              setDraft({ ...form, showInRanking: checked })
            }
            aria-label={labels.showInRankingLabel}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            disabled={updateProfile.isPending || profileQuery.isLoading}
            onClick={() => updateProfile.mutate(form)}
          >
            {updateProfile.isPending ? labels.saving : labels.save}
          </Button>
          {saveStatus === 'success' ? (
            <span className="text-sm text-[var(--color-accent-green)]">
              {labels.saved}
            </span>
          ) : null}
          {saveStatus === 'error' ? (
            <span className="text-sm text-[var(--color-accent-red)]">
              {labels.saveError}
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
};
