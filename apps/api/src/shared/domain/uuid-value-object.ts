import { randomUUID } from 'node:crypto';
import { StringValueObject } from '@/shared/domain/string-value-object';

export abstract class UuidValueObject extends StringValueObject {
  protected static readonly UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  static isValid(value: string): boolean {
    return UuidValueObject.UUID_REGEX.test(value);
  }

  static random(): string {
    return randomUUID();
  }
}
