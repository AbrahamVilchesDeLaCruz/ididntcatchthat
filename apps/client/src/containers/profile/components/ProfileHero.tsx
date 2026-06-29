import { type ReactElement } from 'react';
import { Shield, UserRound } from 'lucide-react';
import { useI18n } from '@/core/i18n';
import { useAuthStore } from '@/core/store/auth.store';
import { useCurrentUser } from '@/core/auth/useCurrentUser';
import { useRankingProfile } from '@/core/profile/useRankingProfile';
import { UserAvatar } from '@/common/components/UserAvatar';
import { Badge } from '@/common/components/ui/badge';
import { cn } from '@/common/lib/utils';

export const ProfileHero = (): ReactElement => {
  const { t } = useI18n();
  const p = t.profile;
  const userId = useAuthStore((s) => s.userId);
  const { isGuest, isTeacher, isAdmin, canEditRankingProfile } =
    useCurrentUser();
  const profileQuery = useRankingProfile({ enabled: canEditRankingProfile });

  const roleLabel = isAdmin
    ? p.account.roleAdmin
    : isTeacher
      ? p.account.roleTeacher
      : isGuest
        ? p.account.roleGuest
        : p.account.roleUser;

  const savedNickname = profileQuery.data?.nickname.trim()
    ? profileQuery.data.nickname
    : null;

  const displayName = savedNickname ?? roleLabel;

  const roleIcon = isAdmin ? (
    <Shield size={12} aria-hidden />
  ) : (
    <UserRound size={12} aria-hidden />
  );

  return (
    <header className="profile-hero-surface relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)]">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[var(--color-brand)] opacity-[0.07] blur-3xl"
      />

      <div className="relative flex flex-col items-center gap-5 px-6 py-8 sm:flex-row sm:items-center sm:gap-6 sm:px-8 sm:py-9">
        <div
          className={cn(
            'rounded-full ring-2 ring-[var(--color-brand)]/25 ring-offset-2 ring-offset-[var(--color-bg-base)]',
            profileQuery.isLoading && canEditRankingProfile
              ? 'animate-pulse'
              : undefined,
          )}
        >
          <UserAvatar nickname={displayName} className="size-24 text-2xl" />
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="text-sm font-medium text-[var(--color-text-muted)]">
            {p.title}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
            {displayName}
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            {p.subtitle}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1 border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)]/80"
            >
              {roleIcon}
              {roleLabel}
            </Badge>

            {canEditRankingProfile && profileQuery.data ? (
              <Badge
                className={
                  profileQuery.data.showInRanking
                    ? 'bg-[var(--color-accent-green)]/15 text-[var(--color-accent-green)]'
                    : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]'
                }
              >
                {profileQuery.data.showInRanking
                  ? p.hero.visibleInRanking
                  : p.hero.hiddenInRanking}
              </Badge>
            ) : null}
          </div>

          {userId ? (
            <p className="mt-3 truncate font-mono text-xs text-[var(--color-text-muted)]">
              {p.account.userIdLabel}: {userId}
            </p>
          ) : null}
        </div>
      </div>
    </header>
  );
};
