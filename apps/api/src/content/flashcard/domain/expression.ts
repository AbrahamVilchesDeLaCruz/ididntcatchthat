import { StringValueObject } from '@/shared/domain/string-value-object';
import { ExpressionEmpty } from './exceptions/expression-empty';
import { ExpressionTooLong } from './exceptions/expression-too-long';

export class Expression extends StringValueObject {
  private static readonly MAX_LENGTH = 200;

  constructor(value: string) {
    super(value);
    this.ensureIsNotEmpty(value);
    this.ensureIsNotTooLong(value);
  }

  private ensureIsNotEmpty(value: string): void {
    if (!value?.trim()) throw new ExpressionEmpty();
  }

  private ensureIsNotTooLong(value: string): void {
    if (value.length > Expression.MAX_LENGTH) throw new ExpressionTooLong();
  }
}
