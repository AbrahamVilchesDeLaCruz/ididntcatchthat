export class ApiRequestError extends Error {
  readonly status: number;
  readonly errorType?: string;

  constructor(message: string, status: number, errorType?: string) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.errorType = errorType;
  }
}

export const isApiRequestError = (error: unknown): error is ApiRequestError =>
  error instanceof ApiRequestError;

export const isMaxPausedGamesError = (error: unknown): boolean =>
  isApiRequestError(error) &&
  (error.status === 409 ||
    error.errorType === 'MaxPausedGamesReached' ||
    error.message.includes('Maximum paused games reached'));
