import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  type GuestAttemptRepository,
  type GuestAttempt,
} from '@/progress/domain/guest-attempt.repository';

@Injectable()
export class TypeOrmGuestAttemptRepository implements GuestAttemptRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findByGameIds(gameIds: string[]): Promise<GuestAttempt[]> {
    if (gameIds.length === 0) return [];

    const rows = await this.dataSource.query<
      {
        flashcard_id: string;
        correct: boolean;
        mode: string;
        answered_at: string;
      }[]
    >(
      `SELECT a.flashcard_id, a.correct, g.mode, a.answered_at
       FROM attempts a
       INNER JOIN games g ON g.id = a.game_id
       WHERE g.id = ANY($1::uuid[])`,
      [gameIds],
    );

    return rows.map((row) => ({
      flashcardId: row.flashcard_id,
      correct: row.correct,
      mode: row.mode,
      answeredAt: row.answered_at,
    }));
  }
}
