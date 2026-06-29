import { useAuthStore, type UserType } from '@/core/store/auth.store';
import {
  canAccessBackofficeFromRoles,
  canManageFlashcardsFromRoles,
} from '@/core/auth/resolveUserRole';

export interface CurrentUser {
  userId: string | null;
  userType: UserType | null;
  roles: string[];
  isGuest: boolean;
  isUser: boolean;
  isTeacher: boolean;
  isAdmin: boolean;
  canStudy: boolean;
  canAccessBackoffice: boolean;
  canManageFlashcards: boolean;
  canAccessObservability: boolean;
}

export function useCurrentUser(): CurrentUser {
  const userType = useAuthStore((s) => s.userType);
  const userId = useAuthStore((s) => s.userId);
  const roles = useAuthStore((s) => s.roles);

  const isAdmin = roles.includes('admin');
  const isTeacher = roles.includes('teacher');
  const isUser = roles.includes('user') && !isAdmin && !isTeacher;
  const canStudy = userType !== null && userType !== 'guest' && userId !== null;

  return {
    userId,
    userType,
    roles,
    isGuest: userType === 'guest',
    isUser,
    isTeacher,
    isAdmin,
    canStudy,
    canAccessBackoffice: canAccessBackofficeFromRoles(roles),
    canManageFlashcards: canManageFlashcardsFromRoles(roles),
    canAccessObservability: isAdmin,
  };
}
