import { StringValueObject } from '@/shared/domain/string-value-object';
import { type AchievementKeyLiteral } from '@/achievement/shared/domain/achievement-key-values';
import { AchievementKeyEmpty } from '@/achievement/shared/domain/exceptions/achievement-key-empty';

export class AchievementKey extends StringValueObject {
  constructor(value: string) {
    super(value);
    if (!value?.trim()) {
      throw new AchievementKeyEmpty();
    }
  }

  static create(value: AchievementKeyLiteral): AchievementKey {
    return new AchievementKey(value);
  }
}
