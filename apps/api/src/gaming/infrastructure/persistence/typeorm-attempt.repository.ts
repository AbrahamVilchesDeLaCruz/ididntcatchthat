import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Attempt } from '@/gaming/domain/attempt';
import { type AttemptRepository } from '@/gaming/domain/attempt.repository';

@Injectable()
export class TypeOrmAttemptRepository implements AttemptRepository {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async save(attempt: Attempt): Promise<void> {
    const p = attempt.toPrimitives();
    await this.dataSource.query(
      `INSERT INTO attempts (id, game_id, flashcard_id, correct, answered_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO NOTHING`,
      [p.id, p.gameId, p.flashcardId, p.correct, p.answeredAt],
    );
  }

  async findByGameId(gameId: string): Promise<Attempt[]> {
    const rows = await this.dataSource.query<
      {
        id: string;
        game_id: string;
        flashcard_id: string;
        correct: boolean;
        answered_at: Date;
      }[]
    >(
      `SELECT id, game_id, flashcard_id, correct, answered_at
       FROM attempts
       WHERE game_id = $1
       ORDER BY answered_at ASC`,
      [gameId],
    );

    return rows.map((r) =>
      Attempt.fromPrimitives({
        id: r.id,
        gameId: r.game_id,
        flashcardId: r.flashcard_id,
        correct: r.correct,
        answeredAt: r.answered_at,
      }),
    );
  }
}
