import type { UserType } from '@/core/store/auth.store';

const USER_TYPES = new Set<UserType>(['guest', 'user', 'teacher', 'admin']);

export interface AccessTokenPayload {
  type?: string;
  userId?: string;
  roles?: string[];
}

/** Decodifica el payload de un JWT (sin verificar firma — solo lectura client-side). */
export function decodeAccessTokenPayload(token: string): AccessTokenPayload {
  try {
    const segment = token.split('.')[1];
    if (!segment) return {};

    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded)) as AccessTokenPayload;
  } catch {
    return {};
  }
}

/** Resuelve el rol efectivo priorizando `roles[]` (fuente de verdad de la API). */
export function resolveUserType(
  type: string | null | undefined,
  roles: string[] = [],
): UserType | null {
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('teacher')) return 'teacher';
  if (roles.includes('user')) return 'user';
  if (roles.includes('guest')) return 'guest';
  if (type && USER_TYPES.has(type as UserType)) return type as UserType;
  return null;
}

export function resolveUserTypeFromAccessToken(token: string): UserType | null {
  const { type, roles } = decodeAccessTokenPayload(token);
  return resolveUserType(type, roles ?? []);
}

export function canManageFlashcardsFromRoles(roles: string[]): boolean {
  return roles.includes('admin');
}

export function canAccessBackofficeFromRoles(roles: string[]): boolean {
  return roles.includes('admin') || roles.includes('teacher');
}
