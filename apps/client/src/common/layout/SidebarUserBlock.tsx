import { type ReactElement } from 'react';
import { ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useI18n } from '@/core/i18n';
import { useCurrentUser } from '@/core/auth/useCurrentUser';
import { useRankingProfile } from '@/core/profile/useRankingProfile';
import { UserAvatar } from '@/common/components/UserAvatar';

interface SidebarUserBlockProps {
  onNavigate?: () => void;
  variant?: 'default' | 'compact';
}

export const SidebarUserBlock = ({
  onNavigate,
  variant = 'default',
}: SidebarUserBlockProps): ReactElement => {
  const { t } = useI18n();
  const { isUser, isTeacher, isAdmin } = useCurrentUser();
  const profileQuery = useRankingProfile({ enabled: isUser });
  const isCompact = variant === 'compact';

  const nickname =
    isUser && profileQuery.data?.nickname.trim()
      ? profileQuery.data.nickname
      : null;

  const displayName =
    nickname ??
    (isAdmin
      ? t.profile.account.roleAdmin
      : isTeacher
        ? t.profile.account.roleTeacher
        : t.profileMenu.fallbackNickname);

  const avatarNickname = nickname ?? displayName;
  const profilePath = isUser ? '/profile#ranking' : '/profile';

  const profileLinkClass = ({ isActive }: { isActive: boolean }): string => {
    const active = isActive
      ? 'bg-[var(--color-brand-dim)] text-[var(--color-brand)]'
      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]';

    return isCompact
      ? `flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors ${active}`
      : `mb-3 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${active}`;
  };

  return (
    <NavLink
      to={profilePath}
      className={profileLinkClass}
      onClick={onNavigate}
      aria-label={displayName}
    >
      <UserAvatar
        nickname={avatarNickname}
        className={isCompact ? 'size-8' : 'size-9'}
      />
      <span className="min-w-0 flex-1 truncate text-sm font-medium">
        {displayName}
      </span>
      {isCompact ? null : (
        <ChevronRight
          size={16}
          className="shrink-0 text-[var(--color-text-muted)]"
          aria-hidden
        />
      )}
    </NavLink>
  );
};
