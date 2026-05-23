import { DataSource } from 'typeorm';
import { UserEntity } from '@/identity/infrastructure/persistence/user.entity';
import { RefreshTokenEntity } from '@/identity/infrastructure/persistence/refresh-token.entity';
import { Migration202605230526271779506787479 } from '../migrations/Migration202605230526271779506787479';

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
  entities: [UserEntity, RefreshTokenEntity],
  migrations: [Migration202605230526271779506787479],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: !isProd,
});
