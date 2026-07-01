import { Inject, Injectable } from '@nestjs/common';
import { type AchievementUnlockRule } from '@/achievement/catalog/domain/achievement-unlock-rule';
import { type AchievementUnlockPolicy } from '@/achievement/catalog/domain/unlock/achievement-unlock-policy';
import { type StudyCompletedUnlockContext } from '@/achievement/catalog/domain/unlock/study-completed-unlock-context';
import {
  type StudyCompletedConditionStrategy,
  STUDY_COMPLETED_CONDITION_STRATEGIES,
} from '@/achievement/catalog/domain/unlock/study-completed-condition-strategy';

@Injectable()
export class StudyCompletedAchievementUnlockPolicy implements AchievementUnlockPolicy<StudyCompletedUnlockContext> {
  readonly ruleType = 'study_completed' as const;

  constructor(
    @Inject(STUDY_COMPLETED_CONDITION_STRATEGIES)
    private readonly conditionStrategies: StudyCompletedConditionStrategy[],
  ) {}

  isEligible(
    rule: AchievementUnlockRule,
    context: StudyCompletedUnlockContext,
  ): boolean {
    if (rule.type !== 'study_completed') return false;

    const strategy = this.conditionStrategies.find(
      (candidate) => candidate.condition === rule.condition,
    );
    if (!strategy) return false;

    return strategy.matches(rule, context);
  }
}
