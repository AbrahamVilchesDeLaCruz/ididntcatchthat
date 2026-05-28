import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  type GuestAttemptRepository,
  type GuestAttempt,
} from '@/progress/domain/guest-attempt.repository';

@Injectable()
export class TypeOrmGuestAttemptRepository implements GuestAttemptRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findByDeviceId(guestDeviceId: string): Promise<GuestAttempt[]> {
    const rows = await this.dataSource.query<
      { flashcard_id: string; correct: boolean; answered_at: string }[]
    >(
      `SELECT a.flashcard_id, a.correct, a.answered_at
       FROM attempts a
       INNER JOIN games g ON g.id = a.game_id
       WHERE g.user_id = $1`,
      [guestDeviceId],
    );

    return rows.map((row) => ({
      flashcardId: row.flashcard_id,
      correct: row.correct,
      mode: 'game',
      answeredAt: row.answered_at,
    }));
  }
}
