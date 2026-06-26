import { describe, expect, it } from 'vitest';
import {
  decodeAccessTokenPayload,
  resolveUserType,
  resolveUserTypeFromAccessToken,
  canManageFlashcardsFromRoles,
} from '../resolveUserRole';

const makeJwt = (payload: Record<string, unknown>): string => {
  const encoded = btoa(JSON.stringify(payload));
  return `header.${encoded}.signature`;
};

describe('resolveUserRole', () => {
  it('prioriza roles[] sobre type del JWT', () => {
    expect(resolveUserType('admin', ['user'])).toBe('user');
    expect(canManageFlashcardsFromRoles(['user'])).toBe(false);
  });

  it('resuelve admin desde roles', () => {
    expect(resolveUserType(undefined, ['admin'])).toBe('admin');
    expect(canManageFlashcardsFromRoles(['admin'])).toBe(true);
  });

  it('decodifica token real de usuario registrado', () => {
    const token = makeJwt({
      type: 'user',
      userId: 'u-1',
      roles: ['user'],
    });

    expect(resolveUserTypeFromAccessToken(token)).toBe('user');
    expect(decodeAccessTokenPayload(token).roles).toEqual(['user']);
  });
});
