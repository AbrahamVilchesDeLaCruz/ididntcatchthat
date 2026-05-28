export interface GuestAttempt {
  flashcardId: string;
  correct: boolean;
  mode: string;
  answeredAt: string;
}

export interface GuestAttemptRepository {
  findByDeviceId(guestDeviceId: string): Promise<GuestAttempt[]>;
}

export const GUEST_ATTEMPT_REPOSITORY = Symbol('GuestAttemptRepository');
