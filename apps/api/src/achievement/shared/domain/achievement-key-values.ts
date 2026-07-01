export const AchievementKeyValue = {
  FirstGame: 'first_game',
  PerfectSession10: 'perfect_session_10',
  Cards100: 'cards_100',
  WeakWarrior: 'weak_warrior',
  Games10: 'games_10',
  Streak7: 'streak_7',
  Streak30: 'streak_30',
  Streak100: 'streak_100',
  ModuleMastery2: 'module_mastery_2',
  ModuleMastery3: 'module_mastery_3',
  ModuleAllTouched: 'module_all_touched',
  StudyFirst: 'study_first',
  StudySessions10: 'study_sessions_10',
} as const;

export type AchievementKeyLiteral =
  (typeof AchievementKeyValue)[keyof typeof AchievementKeyValue];

export const ALL_ACHIEVEMENT_KEY_VALUES = Object.values(
  AchievementKeyValue,
) as AchievementKeyLiteral[];
