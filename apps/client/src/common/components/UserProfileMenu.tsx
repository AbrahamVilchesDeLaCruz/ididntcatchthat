import { type ReactElement, useState } from 'react';
import { Settings2 } from 'lucide-react';
import { useI18n } from '@/core/i18n';
import { useAuthStore } from '@/core/store/auth.store';
import {
  useRankingProfile,
  useUpdateRankingProfile,
} from '@/core/profile/useRankingProfile';
import { useProfileDialogStore } from '@/core/profile/useProfileDialogStore';
import type { RankingProfileVM } from '@/containers/ranking/ranking.types';
import { UserAvatar } from '@/common/components/UserAvatar';
import { Button } from '@/common/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/common/components/ui/dialog';
import { Switch } from '@/common/components/ui/switch';

const defaultProfile = (): RankingProfileVM => ({
  showInRanking: false,
  nickname: '',
});

export const UserProfileMenu = (): ReactElement | null => {
  const { t } = useI18n();
  const userId = useAuthStore((s) => s.userId);
  const userType = useAuthStore((s) => s.userType);
  const open = useProfileDialogStore((s) => s.open);
  const openProfileDialog = useProfileDialogStore((s) => s.openProfileDialog);
  const closeProfileDialog = useProfileDialogStore((s) => s.closeProfileDialog);

  const profileQuery = useRankingProfile();
  const [draft, setDraft] = useState<RankingProfileVM>(defaultProfile());
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>(
    'idle',
  );

  const updateProfile = useUpdateRankingProfile({
    onSuccess: () => {
      setSaveStatus('success');
      window.setTimeout(() => {
        setSaveStatus('idle');
        closeProfileDialog();
      }, 900);
    },
    onError: () => {
      setSaveStatus('error');
      window.setTimeout(() => setSaveStatus('idle'), 4000);
    },
  });

  const syncDraftFromProfile = (): void => {
    setDraft(profileQuery.data ?? defaultProfile());
  };

  if (userType !== 'user' || userId === null) {
    return null;
  }

  const labels = t.profileMenu;
  const savedProfile = profileQuery.data ?? draft;
  const displayNickname =
    savedProfile.nickname.trim().length > 0
      ? savedProfile.nickname
      : labels.fallbackNickname;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          syncDraftFromProfile();
          openProfileDialog();
        }}
        className="mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-[var(--color-bg-elevated)]"
      >
        <UserAvatar nickname={draft.nickname} className="size-9" />
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--color-text-primary)]">
          {displayNickname}
        </span>
        <Settings2
          size={16}
          className="shrink-0 text-[var(--color-text-muted)]"
          aria-hidden
        />
      </button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (next) {
            syncDraftFromProfile();
            openProfileDialog();
          } else {
            closeProfileDialog();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{labels.title}</DialogTitle>
            <DialogDescription>{labels.description}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-3 py-2">
            <UserAvatar nickname={draft.nickname} className="size-20" />
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
                value={draft.nickname}
                minLength={3}
                maxLength={30}
                onChange={(event) =>
                  setDraft({ ...draft, nickname: event.target.value })
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
                checked={draft.showInRanking}
                onCheckedChange={(checked) =>
                  setDraft({ ...draft, showInRanking: checked })
                }
                aria-label={labels.showInRankingLabel}
              />
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                disabled={updateProfile.isPending || profileQuery.isLoading}
                onClick={() => updateProfile.mutate(draft)}
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
        </DialogContent>
      </Dialog>
    </>
  );
};
