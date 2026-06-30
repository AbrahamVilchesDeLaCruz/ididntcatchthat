import {
  type StudyCompletedConditionStrategy,
  type StudyCompletedUnlockRule,
} from '@/achievement/catalog/domain/unlock/study-completed-condition-strategy';
import { type StudyCompletedUnlockContext } from '@/achievement/catalog/domain/unlock/study-completed-unlock-context';

export class FirstStudyCompletedConditionStrategy implements StudyCompletedConditionStrategy {
  readonly condition = 'first' as const;

  matches(
    _rule: StudyCompletedUnlockRule,
    _context: StudyCompletedUnlockContext,
  ): boolean {
    return true;
  }
}

export class SessionsStudyCompletedConditionStrategy implements StudyCompletedConditionStrategy {
  readonly condition = 'sessions' as const;

  matches(
    rule: StudyCompletedUnlockRule,
    context: StudyCompletedUnlockContext,
  ): boolean {
    if (rule.condition !== 'sessions') return false;

    return context.progress.completedStudySessionsCount >= rule.min;
  }
}

export const allStudyCompletedConditionStrategies =
  (): StudyCompletedConditionStrategy[] => [
    new FirstStudyCompletedConditionStrategy(),
    new SessionsStudyCompletedConditionStrategy(),
  ];
