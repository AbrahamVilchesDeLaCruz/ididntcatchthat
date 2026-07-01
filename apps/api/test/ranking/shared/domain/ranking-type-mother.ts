import {
  RankingType,
  RANKING_TYPE_VALUES,
} from '@/ranking/shared/domain/ranking-type';
import { MotherCreator } from '@test/shared/domain/mother-creator';

export class RankingTypeMother {
  static random(): RankingType {
    const value =
      MotherCreator.random().helpers.arrayElement(RANKING_TYPE_VALUES);
    return RankingType.create(value);
  }

  static mostActive(): RankingType {
    return RankingType.create('most_active');
  }

  static mostAccurate(): RankingType {
    return RankingType.create('most_accurate');
  }

  static topScorer(): RankingType {
    return RankingType.create('top_scorer');
  }

  static bestStreak(): RankingType {
    return RankingType.create('best_streak');
  }

  static moduleMaster(): RankingType {
    return RankingType.create('module_master');
  }

  static invalid(): string {
    return 'invalid_type';
  }
}
