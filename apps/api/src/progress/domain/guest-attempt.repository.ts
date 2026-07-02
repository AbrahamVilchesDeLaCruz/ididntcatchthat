export interface GuestAttempt {
  flashcardId: string;
  correct: boolean;
  mode: string;
  answeredAt: string;
}

export interface GuestAttemptRepository {
  findByGameIds(gameIds: string[]): Promise<GuestAttempt[]>;
}

export const GUEST_ATTEMPT_REPOSITORY = Symbol('GuestAttemptRepository');
