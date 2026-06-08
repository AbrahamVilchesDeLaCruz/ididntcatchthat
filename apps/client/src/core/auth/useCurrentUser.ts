import { useAuthStore, type UserType } from '@/core/store/auth.store';

export interface CurrentUser {
  userId: string | null;
  userType: UserType | null;
  roles: string[];
  isGuest: boolean;
  isUser: boolean;
  isTeacher: boolean;
  isAdmin: boolean;
  canAccessBackoffice: boolean;
  canAccessObservability: boolean;
}

export function useCurrentUser(): CurrentUser {
  const userType = useAuthStore((s) => s.userType);
  const userId = useAuthStore((s) => s.userId);
  const roles = useAuthStore((s) => s.roles);

  return {
    userId,
    userType,
    roles,
    isGuest: userType === 'guest',
    isUser: userType === 'user',
    isTeacher: userType === 'teacher',
    isAdmin: userType === 'admin',
    canAccessBackoffice: userType === 'teacher' || userType === 'admin',
    canAccessObservability: userType === 'admin',
  };
}
