import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { type ModuleCoverageQuery } from '@/achievement/domain/module-coverage.query';
import { type UserId } from '@/shared/domain/user-id';

const ALL_MODULES = [
  'native_sounds',
  'connected_speech',
  'flow_connectors',
  'real_talk',
];

@Injectable()
export class TypeOrmModuleCoverageQuery implements ModuleCoverageQuery {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async hasTouchedAllModules(userId: UserId): Promise<boolean> {
    const rows = await this.dataSource.query<{ count: string }[]>(
      `SELECT COUNT(DISTINCT f.category)::int AS count
       FROM user_flashcard_stats ufs
       INNER JOIN flashcards f ON f.id = ufs.flashcard_id
       WHERE ufs.user_id = $1
         AND f.category = ANY($2::varchar[])
         AND (ufs.times_played > 0 OR ufs.times_studied > 0)`,
      [userId.value, ALL_MODULES],
    );
    return Number(rows[0]?.count ?? 0) >= ALL_MODULES.length;
  }
}
