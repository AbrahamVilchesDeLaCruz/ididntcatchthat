import { type DataSourceOptions } from 'typeorm';
import { UserEntity } from '@/identity/user/infrastructure/persistence/user.entity';
import { UserSessionEntity } from '@/identity/session/infrastructure/persistence/user-session.entity';
import { FlashcardEntity } from '@/content/flashcard/infrastructure/persistence/flashcard.entity';
import { GameEntity } from '@/gaming/infrastructure/persistence/game.entity';
import { AttemptEntity } from '@/gaming/infrastructure/persistence/attempt.entity';
import { GameFlashcardEntity } from '@/gaming/infrastructure/persistence/game-flashcard.entity';
import { UserFlashcardStatsEntity } from '@/progress/infrastructure/persistence/typeorm/user-flashcard-stats.entity';
import { ModuleProgressEntity } from '@/progress/infrastructure/persistence/typeorm/module-progress.entity';
import { RankingUserScoreEntity } from '@/ranking/infrastructure/persistence/typeorm/ranking-user-score.entity';
import { ProcessedEventEntity } from '@/shared/infrastructure/persistence/inbox/processed-event.entity';
import { Migration202605230526271779506787479 } from '../migrations/Migration202605230526271779506787479';
import { Migration202605241854361779641676650 } from '../migrations/Migration202605241854361779641676650';
import { Migration202605251200001779720000000 } from '../migrations/Migration202605251200001779720000000';
import { Migration1779773389320 } from '../migrations/Migration1779773389320';
import { Migration202605281913001779988354467 } from '../migrations/Migration202605281913001779988354467';
import { Migration202605281913201779988375165 } from '../migrations/Migration202605281913201779988375165';
import { Migration202606200410001779990000001 } from '../migrations/Migration202606200410001779990000001';
import { Migration202606200519001779990000002 } from '../migrations/Migration202606200519001779990000002';
import { Migration202606200600001779990000003 } from '../migrations/Migration202606200600001779990000003';
import { Migration202606260000000000005 } from '../migrations/Migration202606260000000000005';
import { parseDatabaseUrl, resolveDbSsl } from './resolve-db-ssl';

export const typeOrmEntities = [
  UserEntity,
  UserSessionEntity,
  FlashcardEntity,
  GameEntity,
  AttemptEntity,
  GameFlashcardEntity,
  UserFlashcardStatsEntity,
  ModuleProgressEntity,
  RankingUserScoreEntity,
  ProcessedEventEntity,
];

export const typeOrmMigrations = [
  Migration202605230526271779506787479,
  Migration202605241854361779641676650,
  Migration202605251200001779720000000,
  Migration1779773389320,
  Migration202605281913001779988354467,
  Migration202605281913201779988375165,
  Migration202606200410001779990000001,
  Migration202606200519001779990000002,
  Migration202606200600001779990000003,
  Migration202606260000000000005,
];

export function buildTypeOrmDataSourceOptions(options?: {
  migrationsRun?: boolean;
  logging?: boolean;
}): DataSourceOptions {
  const isProd = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';
  const dbUrl = parseDatabaseUrl(process.env.DATABASE_URL);

  return {
    type: 'postgres' as const,
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port || '5432', 10),
    username: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.replace('/', ''),
    ssl: resolveDbSsl(dbUrl.hostname),
    entities: typeOrmEntities,
    migrations: typeOrmMigrations,
    migrationsTableName: 'migrations',
    migrationsRun: options?.migrationsRun ?? !isProd,
    synchronize: false,
    logging: options?.logging ?? (!isProd && !isTest),
  };
}
