import { UserId } from '@/shared/domain/user-id';

export class ProgressUserIdMother {
  static random(): UserId {
    return UserId.generate();
  }

  static create(value: string): UserId {
    return new UserId(value);
  }
}
