import { describe, it, expect } from 'vitest';
import { capitalizeFirst } from '../game.text';

describe('capitalizeFirst', () => {
  it('uppercases the first character', () => {
    expect(capitalizeFirst('hello')).toBe('Hello');
    expect(capitalizeFirst('hola')).toBe('Hola');
  });

  it('leaves already capitalized text unchanged', () => {
    expect(capitalizeFirst('Hello')).toBe('Hello');
  });

  it('returns empty string unchanged', () => {
    expect(capitalizeFirst('')).toBe('');
  });
});
