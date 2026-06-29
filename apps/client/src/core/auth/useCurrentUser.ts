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
  canEditRankingProfile: boolean;
  canStudy: boolean;
  canAccessBackoffice: boolean;
  canManageFlashcards: boolean;
  canAccessObservability: boolean;
  canAccessRanking: boolean;
}

export function useCurrentUser(): CurrentUser {
  const userType = useAuthStore((s) => s.userType);
  const userId = useAuthStore((s) => s.userId);
  const roles = useAuthStore((s) => s.roles);

  const isAdmin = roles.includes('admin');
  const isTeacher = roles.includes('teacher');
  const isUser = userType === 'user';
  const canStudy = userType !== null && userType !== 'guest' && userId !== null;
  const canEditRankingProfile = canStudy;
  const canAccessBackoffice = canAccessBackofficeFromRoles(roles);
  const canAccessRanking =
    userId !== null &&
    userType !== 'guest' &&
    (isUser || isAdmin || canAccessBackoffice);

  return {
    userId,
    userType,
    roles,
    isGuest: userType === 'guest',
    isUser,
    isTeacher,
    isAdmin,
    canEditRankingProfile,
    canStudy,
    canAccessBackoffice,
    canManageFlashcards: canManageFlashcardsFromRoles(roles),
    canAccessObservability: isAdmin,
    canAccessRanking,
  };
}
