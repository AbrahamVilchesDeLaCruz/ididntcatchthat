export interface AchievementCatalogEntry {
  key: string;
  title: string;
  description: string;
}

export const ACHIEVEMENT_CATALOG: AchievementCatalogEntry[] = [
  {
    key: 'first_game',
    title: 'First steps',
    description: 'Complete your first game',
  },
  {
    key: 'streak_7',
    title: 'Week warrior',
    description: 'Reach a 7-day streak',
  },
  {
    key: 'streak_30',
    title: 'Monthly master',
    description: 'Reach a 30-day streak',
  },
  {
    key: 'module_mastery_2',
    title: 'Solid foundation',
    description: 'Reach mastery level 2 in any module',
  },
  {
    key: 'module_mastery_3',
    title: 'Module master',
    description: 'Reach mastery level 3 in any module',
  },
  {
    key: 'perfect_session_10',
    title: 'Flawless run',
    description: 'Complete a 10+ card game with 100% accuracy',
  },
  {
    key: 'cards_100',
    title: 'Century club',
    description: 'Play 100 flashcards total',
  },
  {
    key: 'weak_warrior',
    title: 'Weak warrior',
    description: 'Complete a weakest-flashcards practice game',
  },
];

export const ACHIEVEMENT_KEYS = ACHIEVEMENT_CATALOG.map((entry) => entry.key);
