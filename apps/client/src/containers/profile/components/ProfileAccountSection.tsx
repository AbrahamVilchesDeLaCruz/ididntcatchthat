import { type ReactElement } from 'react';
import { useI18n } from '@/core/i18n';
import { useAuthStore } from '@/core/store/auth.store';
import { useCurrentUser } from '@/core/auth/useCurrentUser';
import { useRankingProfile } from '@/core/profile/useRankingProfile';
import { UserAvatar } from '@/common/components/UserAvatar';

export const ProfileAccountSection = (): ReactElement => {
  const { t } = useI18n();
  const p = t.profile.account;
  const userId = useAuthStore((s) => s.userId);
  const { isTeacher, isAdmin, canEditRankingProfile } = useCurrentUser();
  const profileQuery = useRankingProfile({ enabled: canEditRankingProfile });

  const roleLabel = isAdmin
    ? p.roleAdmin
    : isTeacher
      ? p.roleTeacher
      : p.roleUser;

  const nickname = profileQuery.data?.nickname.trim()
    ? profileQuery.data.nickname
    : null;

  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
      <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
        {p.title}
      </h2>
      <div className="flex items-center gap-4">
        <UserAvatar
          nickname={nickname ?? roleLabel}
          className="size-16 text-lg"
        />
        <div className="min-w-0">
          <p className="truncate text-base font-medium text-[var(--color-text-primary)]">
            {nickname ?? roleLabel}
          </p>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {roleLabel}
          </p>
          {userId ? (
            <p className="mt-1 truncate text-xs text-[var(--color-text-muted)]">
              {p.userIdLabel}: {userId}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
};
