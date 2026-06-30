export type AchievementUnlockRule =
  | { type: 'game_completed'; condition: 'first' }
  | { type: 'game_completed'; condition: 'weakest_source' }
  | {
      type: 'game_completed';
      condition: 'perfect';
      minCards: number;
    }
  | { type: 'game_completed'; condition: 'total_attempts'; min: number }
  | { type: 'game_completed'; condition: 'completed_games'; min: number }
  | { type: 'game_completed'; condition: 'all_modules_touched' }
  | { type: 'study_completed'; condition: 'first' }
  | { type: 'study_completed'; condition: 'sessions'; min: number }
  | { type: 'streak'; minDays: number }
  | { type: 'module_mastery'; minLevel: number };
