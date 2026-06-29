import { type ReactElement } from 'react';
import { getUserInitials } from '@/common/lib/user-avatar';
import { Avatar, AvatarFallback } from '@/common/components/ui/avatar';

interface UserAvatarProps {
  nickname?: string;
  className?: string;
}

export const UserAvatar = ({
  nickname = '',
  className,
}: UserAvatarProps): ReactElement => (
  <Avatar className={className}>
    <AvatarFallback>{getUserInitials(nickname)}</AvatarFallback>
  </Avatar>
);
