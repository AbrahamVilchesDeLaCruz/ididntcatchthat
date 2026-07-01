import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class GuestGamesMigrator {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async execute(userId: string, gameIds: string[]): Promise<void> {
    if (gameIds.length === 0) return;

    await this.dataSource.query(
      `UPDATE games
       SET user_id = $1
       WHERE id = ANY($2::uuid[])
         AND user_id IS NULL`,
      [userId, gameIds],
    );
  }
}
