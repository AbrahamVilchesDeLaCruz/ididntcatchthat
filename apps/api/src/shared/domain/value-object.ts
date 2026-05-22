export abstract class ValueObject<T> {
  constructor(readonly value: T) {}

  equals(other: ValueObject<T>): boolean {
    return this.value === other.value;
  }
}
