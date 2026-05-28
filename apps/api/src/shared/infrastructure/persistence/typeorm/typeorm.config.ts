import { DataSource } from 'typeorm';
import { UserEntity } from '@/identity/user/infrastructure/persistence/user.entity';
import { UserSessionEntity } from '@/identity/session/infrastructure/persistence/user-session.entity';
import { FlashcardEntity } from '@/content/flashcard/infrastructure/persistence/flashcard.entity';
import { GameEntity } from '@/gaming/infrastructure/persistence/game.entity';
import { AttemptEntity } from '@/gaming/infrastructure/persistence/attempt.entity';
import { GameFlashcardEntity } from '@/gaming/infrastructure/persistence/game-flashcard.entity';
import { Migration202605230526271779506787479 } from '../migrations/Migration202605230526271779506787479';
import { Migration202605241854361779641676650 } from '../migrations/Migration202605241854361779641676650';
import { Migration202605251200001779720000000 } from '../migrations/Migration202605251200001779720000000';
import { Migration1779773389320 } from '../migrations/Migration1779773389320';

const isProd = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

// Parse DATABASE_URL manually to avoid pg-connection-string overriding ssl options
const dbUrl = new URL(
  process.env.DATABASE_URL ?? 'postgres://localhost/defaultdb',
);

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port || '5432', 10),
  username: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.replace('/', ''),
  // test: no SSL (local Docker Postgres)
  // dev:  SSL without strict verification (Aiven dev)
  // prod: SSL with full verification
  ssl: isProd
    ? { rejectUnauthorized: true }
    : isTest
      ? false
      : { rejectUnauthorized: false },
  entities: [
    UserEntity,
    UserSessionEntity,
    FlashcardEntity,
    GameEntity,
    AttemptEntity,
    GameFlashcardEntity,
  ],
  migrations: [
    Migration202605230526271779506787479,
    Migration202605241854361779641676650,
    Migration202605251200001779720000000,
    Migration1779773389320,
  ],
  migrationsTableName: 'migrations',
  migrationsRun: !isProd, // auto-run on dev/test; in prod use CLI
  synchronize: false,
  logging: !isProd && !isTest,
});
