import { getMetadataArgsStorage } from 'typeorm';
import { RANKING_USER_STATS_SQL_CONTRACT } from '@/ranking/projection/domain/ranking-user-stats-sql-contract';
import { GameEntity } from '@/gaming/infrastructure/persistence/game.entity';
import { UserFlashcardStatsEntity } from '@/progress/infrastructure/persistence/typeorm/user-flashcard-stats.entity';
import { ModuleProgressEntity } from '@/progress/infrastructure/persistence/typeorm/module-progress.entity';

type EntityClass = new (...args: never[]) => object;

function columnNamesForEntity(entity: EntityClass): Set<string> {
  const storage = getMetadataArgsStorage();

  const names = storage.columns
    .filter((column) => column.target === entity)
    .map((column) => {
      const optionName = column.options.name;
      if (typeof optionName === 'string') return optionName;
      return column.propertyName;
    });

  return new Set(names);
}

function tableNameForEntity(entity: EntityClass): string | undefined {
  const storage = getMetadataArgsStorage();
  const table = storage.tables.find((entry) => entry.target === entity);
  if (!table) return undefined;

  const name = table.name ?? table.options?.name;
  return typeof name === 'string' ? name : undefined;
}

describe('ranking/projection/domain RankingUserStatsQuery SQL contract parity', () => {
  it('should reference games columns that exist on GameEntity', () => {
    const columns = columnNamesForEntity(GameEntity);

    for (const column of RANKING_USER_STATS_SQL_CONTRACT.games.columns) {
      expect(columns.has(column)).toBe(true);
    }
  });

  it('should reference user_flashcard_stats columns that exist on UserFlashcardStatsEntity', () => {
    const columns = columnNamesForEntity(UserFlashcardStatsEntity);

    for (const column of RANKING_USER_STATS_SQL_CONTRACT.userFlashcardStats
      .columns) {
      expect(columns.has(column)).toBe(true);
    }
  });

  it('should reference module_progress columns that exist on ModuleProgressEntity', () => {
    const columns = columnNamesForEntity(ModuleProgressEntity);

    for (const column of RANKING_USER_STATS_SQL_CONTRACT.moduleProgress
      .columns) {
      expect(columns.has(column)).toBe(true);
    }
  });

  it('should keep contract table names aligned with TypeORM entities', () => {
    expect(tableNameForEntity(GameEntity)).toBe(
      RANKING_USER_STATS_SQL_CONTRACT.games.table,
    );
    expect(tableNameForEntity(UserFlashcardStatsEntity)).toBe(
      RANKING_USER_STATS_SQL_CONTRACT.userFlashcardStats.table,
    );
    expect(tableNameForEntity(ModuleProgressEntity)).toBe(
      RANKING_USER_STATS_SQL_CONTRACT.moduleProgress.table,
    );
  });
});
