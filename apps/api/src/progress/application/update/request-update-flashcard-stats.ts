export type RequestUpdateFlashcardStats = {
  userId: string;
  flashcardId: string;
  correct: boolean;
  mode: string;
};
