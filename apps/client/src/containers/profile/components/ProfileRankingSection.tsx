import { type ReactElement, useState } from 'react';
import { AlertCircle, Check, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/core/i18n';
import {
  useRankingProfile,
  useUpdateRankingProfile,
} from '@/core/profile/useRankingProfile';
import type { RankingProfileVM } from '@/containers/ranking/ranking.types';
import { UserAvatar } from '@/common/components/UserAvatar';
import { Badge } from '@/common/components/ui/badge';
import { Button } from '@/common/components/ui/button';
import { Switch } from '@/common/components/ui/switch';
import { cn } from '@/common/lib/utils';

const NICKNAME_MIN = 3;
const NICKNAME_MAX = 30;

const defaultProfile = (): RankingProfileVM => ({
  showInRanking: false,
  nickname: '',
});

const profilesEqual = (
  left: RankingProfileVM,
  right: RankingProfileVM,
): boolean =>
  left.nickname === right.nickname &&
  left.showInRanking === right.showInRanking;

const isNicknameValid = (nickname: string): boolean =>
  nickname.trim().length >= NICKNAME_MIN && nickname.length <= NICKNAME_MAX;

export const ProfileRankingSection = (): ReactElement => {
  const { t } = useI18n();
  const section = t.profile.ranking;
  const labels = t.profileMenu;
  const profileQuery = useRankingProfile();
  const savedProfile = profileQuery.data ?? defaultProfile();
  const [draft, setDraft] = useState<RankingProfileVM | null>(null);
  const form = draft ?? savedProfile;
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>(
    'idle',
  );

  const isDirty = draft !== null && !profilesEqual(draft, savedProfile);
  const nicknameValid = isNicknameValid(form.nickname);
  const previewNickname = form.nickname.trim() || labels.fallbackNickname;
  const showNicknameError =
    form.nickname.length > 0 &&
    !nicknameValid &&
    form.nickname.trim().length < NICKNAME_MIN;

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

  const updateForm = (next: RankingProfileVM): void => {
    setSaveStatus('idle');
    setDraft(next);
  };

  const handleDiscard = (): void => {
    setDraft(null);
    setSaveStatus('idle');
  };

  if (profileQuery.isLoading) {
    return (
      <div
        aria-busy="true"
        className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5"
      >
        <div className="h-16 animate-pulse rounded-xl bg-[var(--color-bg-base)]" />
        <div className="h-10 animate-pulse rounded-lg bg-[var(--color-bg-base)]" />
        <div className="h-14 animate-pulse rounded-xl bg-[var(--color-bg-base)]" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
      <div className="border-b border-[var(--color-border)] bg-[var(--color-bg-base)]/40 px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
          {section.previewTitle}
        </p>
        <div
          className={cn(
            'mt-3 flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2.5 transition-opacity',
            form.showInRanking ? 'opacity-100' : 'opacity-50',
          )}
        >
          <span className="w-7 shrink-0 text-sm font-medium tabular-nums text-[var(--color-text-muted)]">
            #{section.previewRankPlaceholder}
          </span>
          <UserAvatar nickname={previewNickname} className="size-8" />
          <span className="min-w-0 flex-1 truncate font-medium text-[var(--color-text-primary)]">
            {previewNickname}
          </span>
          {form.showInRanking ? (
            <Badge className="shrink-0 bg-[var(--color-brand)] text-white">
              {t.ranking.table.you}
            </Badge>
          ) : (
            <span className="shrink-0 text-xs text-[var(--color-text-muted)]">
              {section.previewHidden}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label
              htmlFor="profile-nickname"
              className="text-sm font-medium text-[var(--color-text-primary)]"
            >
              {labels.nicknameLabel}
            </label>
            <span className="text-xs tabular-nums text-[var(--color-text-muted)]">
              {form.nickname.length}/{NICKNAME_MAX}
            </span>
          </div>
          <input
            id="profile-nickname"
            className={cn(
              'w-full rounded-lg border bg-[var(--color-bg-base)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] transition focus:outline-none focus:ring-2',
              showNicknameError
                ? 'border-[var(--color-accent-red)]/60 focus:ring-[var(--color-accent-red)]/25'
                : 'border-[var(--color-border)] focus:border-transparent focus:ring-[var(--color-brand-dim)]',
            )}
            value={form.nickname}
            minLength={NICKNAME_MIN}
            maxLength={NICKNAME_MAX}
            onChange={(event) =>
              updateForm({ ...form, nickname: event.target.value })
            }
            placeholder={labels.nicknamePlaceholder}
          />
          <p
            className={cn(
              'text-xs',
              showNicknameError
                ? 'text-[var(--color-accent-red)]'
                : 'text-[var(--color-text-muted)]',
            )}
          >
            {showNicknameError
              ? section.nicknameTooShort
              : section.nicknameHint}
          </p>
        </div>

        <div
          className={cn(
            'rounded-xl border p-4 transition-colors',
            form.showInRanking
              ? 'border-[var(--color-brand)]/35 bg-[var(--color-brand)]/5'
              : 'border-[var(--color-border)] bg-[var(--color-bg-base)]/35',
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <div
                className={cn(
                  'rounded-lg p-2',
                  form.showInRanking
                    ? 'bg-[var(--color-brand)]/15 text-[var(--color-brand)]'
                    : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]',
                )}
              >
                {form.showInRanking ? (
                  <Eye size={18} aria-hidden />
                ) : (
                  <EyeOff size={18} aria-hidden />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {labels.showInRankingLabel}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-text-muted)]">
                  {labels.showInRankingHint}
                </p>
              </div>
            </div>
            <Switch
              checked={form.showInRanking}
              onCheckedChange={(checked) =>
                updateForm({ ...form, showInRanking: checked })
              }
              aria-label={labels.showInRankingLabel}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--color-border)] bg-[var(--color-bg-base)]/25 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/ranking"
          className="text-sm font-medium text-[var(--color-brand)] transition hover:opacity-80"
        >
          {section.viewRanking} →
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-3">
          {isDirty ? (
            <span className="text-xs text-[var(--color-text-muted)]">
              {section.unsavedHint}
            </span>
          ) : null}
          {isDirty ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDiscard}
              disabled={updateProfile.isPending}
            >
              {section.discard}
            </Button>
          ) : null}
          {saveStatus === 'success' ? (
            <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-accent-green)]">
              <Check size={16} aria-hidden />
              {labels.saved}
            </span>
          ) : null}
          {saveStatus === 'error' ? (
            <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-accent-red)]">
              <AlertCircle size={16} aria-hidden />
              {labels.saveError}
            </span>
          ) : null}
          <Button
            type="button"
            disabled={
              !isDirty ||
              !nicknameValid ||
              updateProfile.isPending ||
              profileQuery.isLoading
            }
            onClick={() => updateProfile.mutate(form)}
          >
            {updateProfile.isPending ? labels.saving : labels.save}
          </Button>
        </div>
      </div>
    </div>
  );
};
