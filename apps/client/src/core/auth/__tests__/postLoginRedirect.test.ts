import { describe, expect, it } from 'vitest';
import {
  getAuthenticatedHomePath,
  getPostLoginPath,
} from '../postLoginRedirect';

describe('postLoginRedirect', () => {
  it('envía admin al backoffice de flashcards', () => {
    expect(getPostLoginPath('admin')).toBe('/backoffice/flashcards');
  });

  it('envía teacher a métricas de juegos', () => {
    expect(getPostLoginPath('teacher')).toBe('/backoffice/games');
  });

  it('envía user y guest a estadísticas', () => {
    expect(getPostLoginPath('user')).toBe('/stats');
    expect(getPostLoginPath('guest')).toBe('/stats');
    expect(getPostLoginPath(null)).toBe('/stats');
  });

  it('getAuthenticatedHomePath usa la misma lógica que post-login', () => {
    expect(getAuthenticatedHomePath('admin')).toBe('/backoffice/flashcards');
    expect(getAuthenticatedHomePath('user')).toBe('/stats');
  });
});
