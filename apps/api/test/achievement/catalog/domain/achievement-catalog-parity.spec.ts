import { AchievementCatalog } from '@/achievement/catalog/domain/achievement-catalog';
import {
  ALL_ACHIEVEMENT_KEY_VALUES,
  type AchievementKeyLiteral,
} from '@/achievement/shared/domain/achievement-key-values';

/**
 * Keys seeded by achievement migrations:
 * - Migration202606271200001779990000006 (initial catalog)
 * - Migration202606301200001779990000009 (v2 additions)
 *
 * Keep in sync when adding achievements — domain catalog and migrations must match.
 */
const MIGRATION_SEED_KEYS: AchievementKeyLiteral[] = [
  'first_game',
  'streak_7',
  'streak_30',
  'module_mastery_2',
  'module_mastery_3',
  'perfect_session_10',
  'cards_100',
  'weak_warrior',
  'games_10',
  'streak_100',
  'module_all_touched',
  'study_first',
  'study_sessions_10',
];

function sortedKeys(keys: readonly string[]): string[] {
  return [...keys].sort();
}

describe('achievement/catalog/domain AchievementCatalog parity', () => {
  const catalogKeys = new AchievementCatalog()
    .list()
    .map((definition) => definition.key.value);

  it('should expose exactly the canonical achievement keys', () => {
    expect(sortedKeys(catalogKeys)).toEqual(
      sortedKeys(ALL_ACHIEVEMENT_KEY_VALUES),
    );
  });

  it('should stay in sync with migration seed keys', () => {
    expect(sortedKeys(catalogKeys)).toEqual(sortedKeys(MIGRATION_SEED_KEYS));
  });

  it('should keep canonical keys aligned with migration seed keys', () => {
    expect(sortedKeys(ALL_ACHIEVEMENT_KEY_VALUES)).toEqual(
      sortedKeys(MIGRATION_SEED_KEYS),
    );
  });
});
