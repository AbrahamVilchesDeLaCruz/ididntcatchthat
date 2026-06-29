import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { View } from '@/gaming/domain/view';
import { type ViewRepository } from '@/gaming/domain/view.repository';

@Injectable()
export class TypeOrmViewRepository implements ViewRepository {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async save(view: View): Promise<void> {
    const p = view.toPrimitives();
    await this.dataSource.query(
      `INSERT INTO game_views (id, game_id, flashcard_id, viewed_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO NOTHING`,
      [p.id, p.gameId, p.flashcardId, p.viewedAt],
    );
  }

  async findByGameId(gameId: string): Promise<View[]> {
    const rows = await this.dataSource.query<
      {
        id: string;
        game_id: string;
        flashcard_id: string;
        viewed_at: Date;
      }[]
    >(
      `SELECT id, game_id, flashcard_id, viewed_at
       FROM game_views
       WHERE game_id = $1
       ORDER BY viewed_at ASC`,
      [gameId],
    );

    return rows.map((r) =>
      View.fromPrimitives({
        id: r.id,
        gameId: r.game_id,
        flashcardId: r.flashcard_id,
        viewedAt: r.viewed_at,
      }),
    );
  }
}
