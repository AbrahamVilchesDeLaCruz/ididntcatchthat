export type AchievementCategory = 'game' | 'streak' | 'module' | 'study';

export interface AchievementCatalogEntry {
  key: string;
  category: AchievementCategory;
  sortOrder: number;
}

export const ACHIEVEMENT_CATALOG: AchievementCatalogEntry[] = [
  { key: 'first_game', category: 'game', sortOrder: 1 },
  { key: 'perfect_session_10', category: 'game', sortOrder: 2 },
  { key: 'cards_100', category: 'game', sortOrder: 3 },
  { key: 'weak_warrior', category: 'game', sortOrder: 4 },
  { key: 'games_10', category: 'game', sortOrder: 5 },
  { key: 'streak_7', category: 'streak', sortOrder: 10 },
  { key: 'streak_30', category: 'streak', sortOrder: 11 },
  { key: 'streak_100', category: 'streak', sortOrder: 12 },
  { key: 'module_mastery_2', category: 'module', sortOrder: 20 },
  { key: 'module_mastery_3', category: 'module', sortOrder: 21 },
  { key: 'module_all_touched', category: 'module', sortOrder: 22 },
  { key: 'study_first', category: 'study', sortOrder: 30 },
  { key: 'study_sessions_10', category: 'study', sortOrder: 31 },
];

export const ACHIEVEMENT_KEYS = ACHIEVEMENT_CATALOG.map((entry) => entry.key);

export const ACHIEVEMENT_BY_KEY = new Map(
  ACHIEVEMENT_CATALOG.map((entry) => [entry.key, entry]),
);

export function getAchievementCategory(key: string): AchievementCategory {
  const entry = ACHIEVEMENT_BY_KEY.get(key);
  if (!entry) {
    throw new Error(`Unknown achievement key: ${key}`);
  }
  return entry.category;
}
