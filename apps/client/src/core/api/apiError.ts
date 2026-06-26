export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly errorType?: string,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export const isApiRequestError = (error: unknown): error is ApiRequestError =>
  error instanceof ApiRequestError;

export const isMaxPausedGamesError = (error: unknown): boolean =>
  isApiRequestError(error) &&
  (error.status === 409 ||
    error.errorType === 'MaxPausedGamesReached' ||
    error.message.includes('Maximum paused games reached'));
