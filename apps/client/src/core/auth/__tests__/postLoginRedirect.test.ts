import { describe, expect, it } from 'vitest';
import {
  DEFAULT_AUTHENTICATED_HOME,
  getAuthenticatedHomePath,
  getPostLoginPath,
} from '../postLoginRedirect';

describe('postLoginRedirect', () => {
  it('envía todos los roles al hub /home', () => {
    expect(getPostLoginPath('admin')).toBe('/home');
    expect(getPostLoginPath('teacher')).toBe('/home');
    expect(getPostLoginPath('user')).toBe('/home');
    expect(getPostLoginPath('guest')).toBe('/home');
    expect(getPostLoginPath(null)).toBe('/home');
  });

  it('getAuthenticatedHomePath apunta al hub', () => {
    expect(getAuthenticatedHomePath('admin')).toBe(DEFAULT_AUTHENTICATED_HOME);
    expect(getAuthenticatedHomePath('user')).toBe(DEFAULT_AUTHENTICATED_HOME);
  });
});
