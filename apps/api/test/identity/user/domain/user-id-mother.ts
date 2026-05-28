import { UuidMother } from '@test/shared/domain/uuid-mother';
import { UserId } from '@/shared/domain/user-id';

export class UserIdMother {
  static random(): UserId {
    return new UserId(UuidMother.random());
  }

  static withValue(value: string): UserId {
    return new UserId(value);
  }

  static invalid(): string {
    return 'not-a-uuid';
  }
}
