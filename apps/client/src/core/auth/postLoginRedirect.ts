import type { UserType } from '@/core/store/auth.store';

/** Ruta hub por defecto tras login/registro. */
export const DEFAULT_AUTHENTICATED_HOME = '/home';

/** Ruta por defecto tras login/registro — hub unificado para todos los roles. */
export function getPostLoginPath(_userType: UserType | null): string {
  return DEFAULT_AUTHENTICATED_HOME;
}

/** Atajo cuando ya tenemos el array `roles` del store o del token. */
export function getPostLoginPathFromRoles(_roles: string[]): string {
  return DEFAULT_AUTHENTICATED_HOME;
}

/** Enlace "home" para usuarios autenticados. */
export function getAuthenticatedHomePath(_userType: UserType | null): string {
  return DEFAULT_AUTHENTICATED_HOME;
}

export function getAuthenticatedHomePathFromRoles(_roles: string[]): string {
  return DEFAULT_AUTHENTICATED_HOME;
}
