export type RequestAttemptRecorder = {
  gameId: string;
  flashcardId: string;
  correct: boolean;
  userId: string | null;
};
