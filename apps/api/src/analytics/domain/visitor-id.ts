import { StringValueObject } from '@/shared/domain/string-value-object';
import { VisitorIdInvalid } from './errors/visitor-id-invalid';

export class VisitorId extends StringValueObject {
  private static readonly MAX_LENGTH = 100;

  constructor(value: string) {
    if (!value?.trim() || value.length > VisitorId.MAX_LENGTH) {
      throw new VisitorIdInvalid(value ?? '');
    }
    super(value);
  }
}
