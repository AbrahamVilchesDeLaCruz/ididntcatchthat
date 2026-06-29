import { StringValueObject } from '@/shared/domain/string-value-object';
import { PagePathInvalid } from './errors/page-path-invalid';

export class PagePath extends StringValueObject {
  private static readonly MAX_LENGTH = 500;

  constructor(value: string) {
    if (!value?.trim() || value.length > PagePath.MAX_LENGTH) {
      throw new PagePathInvalid(value ?? '');
    }
    super(value);
  }
}
