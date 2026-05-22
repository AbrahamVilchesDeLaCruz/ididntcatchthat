import { StringValueObject } from '@/shared/domain/string-value-object';

export abstract class UuidValueObject extends StringValueObject {
  private static readonly UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  constructor(value: string) {
    super(value);
    if (!UuidValueObject.UUID_REGEX.test(value)) {
      throw new Error(`<${value}> is not a valid UUID v4`);
    }
  }

  static random(): string {
    return crypto.randomUUID();
  }
}
