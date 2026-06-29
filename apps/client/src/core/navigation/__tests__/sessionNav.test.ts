import { beforeEach, describe, expect, it } from 'vitest';
import {
  consumeReturnTo,
  getPostAuthPath,
  hasHomeEntered,
  markHomeEntered,
  persistReturnTo,
  shouldTrackAuthenticatedRoute,
  trackAuthenticatedRoute,
} from '../sessionNav';

describe('sessionNav', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('getPostAuthPath respeta returnTo explícito', () => {
    expect(getPostAuthPath({ returnTo: '/study' })).toBe('/study');
  });

  it('getPostAuthPath consume returnTo de sessionStorage', () => {
    persistReturnTo('/ranking');
    expect(getPostAuthPath()).toBe('/ranking');
    expect(sessionStorage.getItem('idct-return-to')).toBeNull();
  });

  it('getPostAuthPath envía a /home si no hay home entered', () => {
    expect(getPostAuthPath()).toBe('/home');
  });

  it('getPostAuthPath usa última ruta tras home entered', () => {
    markHomeEntered();
    trackAuthenticatedRoute('/stats');
    expect(getPostAuthPath()).toBe('/stats');
  });

  it('markHomeEntered persiste flag en sessionStorage', () => {
    expect(hasHomeEntered()).toBe(false);
    markHomeEntered();
    expect(hasHomeEntered()).toBe(true);
  });

  it('consumeReturnTo elimina la clave', () => {
    persistReturnTo('/game');
    expect(consumeReturnTo()).toBe('/game');
    expect(consumeReturnTo()).toBeNull();
  });

  it('shouldTrackAuthenticatedRoute ignora rutas de auth', () => {
    expect(shouldTrackAuthenticatedRoute('/auth/login')).toBe(false);
    expect(shouldTrackAuthenticatedRoute('/home')).toBe(true);
  });
});
