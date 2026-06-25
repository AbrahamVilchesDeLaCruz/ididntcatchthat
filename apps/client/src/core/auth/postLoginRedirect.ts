import type { UserType } from '@/core/store/auth.store';
import { resolveUserType } from '@/core/auth/resolveUserRole';

/** Ruta por defecto tras login/registro según rol del JWT. */
export function getPostLoginPath(userType: UserType | null): string {
  switch (userType) {
    case 'admin':
      return '/backoffice/flashcards';
    case 'teacher':
      return '/backoffice/games';
    default:
      return '/stats';
  }
}

/** Atajo cuando ya tenemos el array `roles` del store o del token. */
export function getPostLoginPathFromRoles(roles: string[]): string {
  return getPostLoginPath(resolveUserType(undefined, roles));
}

/** Enlace "home" para usuarios autenticados (dashboard o progreso). */
export function getAuthenticatedHomePath(userType: UserType | null): string {
  return getPostLoginPath(userType);
}

export function getAuthenticatedHomePathFromRoles(roles: string[]): string {
  return getPostLoginPathFromRoles(roles);
}
