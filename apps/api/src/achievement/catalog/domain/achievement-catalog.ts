import { Injectable } from '@nestjs/common';
import { AchievementKey } from '@/achievement/shared/domain/achievement-key';
import {
  AchievementKeyLiteral,
  AchievementKeyValue,
} from '@/achievement/shared/domain/achievement-key-values';
import { AchievementKeyUnknown } from '@/achievement/catalog/domain/exceptions/achievement-key-unknown';
import {
  AchievementDefinition,
  type AchievementDefinitionPrimitives,
} from '@/achievement/catalog/domain/achievement-definition';
import { type AchievementUnlockRule } from '@/achievement/catalog/domain/achievement-unlock-rule';

const CATALOG_ENTRIES: AchievementDefinitionPrimitives[] = [
  {
    key: AchievementKeyValue.FirstGame,
    category: 'game',
    sortOrder: 1,
    unlockRule: { type: 'game_completed', condition: 'first' },
  },
  {
    key: AchievementKeyValue.PerfectSession10,
    category: 'game',
    sortOrder: 2,
    unlockRule: { type: 'game_completed', condition: 'perfect', minCards: 10 },
  },
  {
    key: AchievementKeyValue.Cards100,
    category: 'game',
    sortOrder: 3,
    unlockRule: {
      type: 'game_completed',
      condition: 'total_attempts',
      min: 100,
    },
  },
  {
    key: AchievementKeyValue.WeakWarrior,
    category: 'game',
    sortOrder: 4,
    unlockRule: { type: 'game_completed', condition: 'weakest_source' },
  },
  {
    key: AchievementKeyValue.Games10,
    category: 'game',
    sortOrder: 5,
    unlockRule: {
      type: 'game_completed',
      condition: 'completed_games',
      min: 10,
    },
  },
  {
    key: AchievementKeyValue.Streak7,
    category: 'streak',
    sortOrder: 10,
    unlockRule: { type: 'streak', minDays: 7 },
  },
  {
    key: AchievementKeyValue.Streak30,
    category: 'streak',
    sortOrder: 11,
    unlockRule: { type: 'streak', minDays: 30 },
  },
  {
    key: AchievementKeyValue.Streak100,
    category: 'streak',
    sortOrder: 12,
    unlockRule: { type: 'streak', minDays: 100 },
  },
  {
    key: AchievementKeyValue.ModuleMastery2,
    category: 'module',
    sortOrder: 20,
    unlockRule: { type: 'module_mastery', minLevel: 2 },
  },
  {
    key: AchievementKeyValue.ModuleMastery3,
    category: 'module',
    sortOrder: 21,
    unlockRule: { type: 'module_mastery', minLevel: 3 },
  },
  {
    key: AchievementKeyValue.ModuleAllTouched,
    category: 'module',
    sortOrder: 22,
    unlockRule: { type: 'game_completed', condition: 'all_modules_touched' },
  },
  {
    key: AchievementKeyValue.StudyFirst,
    category: 'study',
    sortOrder: 30,
    unlockRule: { type: 'study_completed', condition: 'first' },
  },
  {
    key: AchievementKeyValue.StudySessions10,
    category: 'study',
    sortOrder: 31,
    unlockRule: { type: 'study_completed', condition: 'sessions', min: 10 },
  },
];

@Injectable()
export class AchievementCatalog {
  private readonly definitions: AchievementDefinition[];

  constructor() {
    this.definitions = CATALOG_ENTRIES.map((entry) =>
      AchievementDefinition.fromPrimitives(entry),
    ).sort((left, right) => left.sortOrder - right.sortOrder);
  }

  list(): AchievementDefinition[] {
    return [...this.definitions];
  }

  get(key: AchievementKey | AchievementKeyLiteral): AchievementDefinition {
    const definition = this.find(key);
    if (!definition) {
      const literal = key instanceof AchievementKey ? key.value : key;
      throw new AchievementKeyUnknown(literal);
    }
    return definition;
  }

  find(
    key: AchievementKey | AchievementKeyLiteral,
  ): AchievementDefinition | null {
    const literal = key instanceof AchievementKey ? key.value : key;
    return (
      this.definitions.find((definition) => definition.key.value === literal) ??
      null
    );
  }

  findByUnlockRuleType(
    ruleType: AchievementUnlockRule['type'],
  ): AchievementDefinition[] {
    return this.definitions.filter(
      (definition) => definition.unlockRule.type === ruleType,
    );
  }
}
