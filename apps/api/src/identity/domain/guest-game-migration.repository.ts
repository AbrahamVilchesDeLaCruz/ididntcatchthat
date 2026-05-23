// Port for migrating guest game sessions to a registered user.
// Implementation lives in the games bounded context.
export type GuestGameAttempt = {
  attemptId: string;
  answer: string;
  isCorrect: boolean;
  answeredAt: Date;
};

export type GuestGame = {
  gameId: string;
  phraseId: string;
  completedAt: Date;
  score: number;
  attempts: GuestGameAttempt[];
};

export interface GuestGameMigrationRepository {
  migrateGames(userId: string, games: GuestGame[]): Promise<void>;
}

export const GUEST_GAME_MIGRATION_REPOSITORY = Symbol(
  'GuestGameMigrationRepository',
);
