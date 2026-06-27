import { describe, it, expect } from 'vitest';
import {
  ApiRequestError,
  isApiRequestError,
  isMaxPausedGamesError,
} from '../apiError';

describe('apiError', () => {
  it('creates ApiRequestError with status and errorType', () => {
    const error = new ApiRequestError('Conflict', 409, 'MaxPausedGamesReached');

    expect(error.message).toBe('Conflict');
    expect(error.status).toBe(409);
    expect(error.errorType).toBe('MaxPausedGamesReached');
    expect(error.name).toBe('ApiRequestError');
  });

  it('detects ApiRequestError instances', () => {
    expect(isApiRequestError(new ApiRequestError('fail', 500))).toBe(true);
    expect(isApiRequestError(new Error('fail'))).toBe(false);
  });

  it('detects max paused games by status', () => {
    expect(isMaxPausedGamesError(new ApiRequestError('x', 409))).toBe(true);
  });

  it('detects max paused games by errorType', () => {
    expect(
      isMaxPausedGamesError(
        new ApiRequestError('x', 400, 'MaxPausedGamesReached'),
      ),
    ).toBe(true);
  });

  it('detects max paused games by message', () => {
    expect(
      isMaxPausedGamesError(
        new ApiRequestError('Maximum paused games reached', 400),
      ),
    ).toBe(true);
  });

  it('returns false for unrelated errors', () => {
    expect(isMaxPausedGamesError(new ApiRequestError('Not found', 404))).toBe(
      false,
    );
    expect(isMaxPausedGamesError(new Error('boom'))).toBe(false);
  });
});
