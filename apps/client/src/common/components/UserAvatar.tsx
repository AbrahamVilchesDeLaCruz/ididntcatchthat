import { type ReactElement } from 'react';
import { cn } from '@/common/lib/utils';
import {
  createUserAvatarDataUri,
  getUserInitials,
} from '@/common/lib/user-avatar';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/common/components/ui/avatar';

interface UserAvatarProps {
  userId: string;
  nickname?: string;
  className?: string;
  imageClassName?: string;
}

export const UserAvatar = ({
  userId,
  nickname = '',
  className,
  imageClassName,
}: UserAvatarProps): ReactElement => (
  <Avatar className={className}>
    <AvatarImage
      src={createUserAvatarDataUri(userId)}
      alt={nickname || 'User avatar'}
      className={imageClassName}
    />
    <AvatarFallback>{getUserInitials(nickname)}</AvatarFallback>
  </Avatar>
);

export const UserAvatarImage = ({
  userId,
  className,
}: {
  userId: string;
  className?: string;
}): ReactElement => (
  <img
    src={createUserAvatarDataUri(userId)}
    alt=""
    className={cn('rounded-full object-cover', className)}
  />
);
