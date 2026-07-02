import { type AchievementUnlockRule } from '@/achievement/catalog/domain/achievement-unlock-rule';
import { type StudyCompletedUnlockContext } from '@/achievement/catalog/domain/unlock/study-completed-unlock-context';

export type StudyCompletedUnlockRule = Extract<
  AchievementUnlockRule,
  { type: 'study_completed' }
>;

export type StudyCompletedUnlockCondition =
  StudyCompletedUnlockRule['condition'];

export interface StudyCompletedConditionStrategy {
  readonly condition: StudyCompletedUnlockCondition;
  matches(
    rule: StudyCompletedUnlockRule,
    context: StudyCompletedUnlockContext,
  ): boolean;
}

export const STUDY_COMPLETED_CONDITION_STRATEGIES = Symbol(
  'StudyCompletedConditionStrategies',
);
