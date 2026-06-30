import { UuidValueObject } from '@/shared/domain/uuid-value-object';

export class PageViewId extends UuidValueObject {
  constructor(value: string) {
    super(value);
  }

  static generate(): PageViewId {
    return new PageViewId(UuidValueObject.random());
  }
}
