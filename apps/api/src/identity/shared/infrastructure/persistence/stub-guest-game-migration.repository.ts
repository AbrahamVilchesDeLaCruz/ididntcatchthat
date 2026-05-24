import { Injectable } from '@nestjs/common';
import {
  type GuestGame,
  type GuestGameMigrationRepository,
} from '@/identity/user/domain/guest-game-migration.repository';

/**
 * Stub implementation — the real implementation lives in the games bounded context.
 * This will be replaced once the games BC is implemented.
 */
@Injectable()
export class StubGuestGameMigrationRepository implements GuestGameMigrationRepository {
  async migrateGames(_userId: string, _games: GuestGame[]): Promise<void> {
    // no-op stub
  }
}
