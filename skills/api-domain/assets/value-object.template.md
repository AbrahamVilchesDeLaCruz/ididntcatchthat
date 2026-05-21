# Template — Value Objects

Reemplazá `__EntityName__` y `__FieldName__` por los nombres reales.

## UUID — para IDs de aggregates

```typescript
import { UuidValueObject } from '@shared/domain/value-objects/uuid.value-object';

export class __EntityName__Id extends UuidValueObject {
  static random(): __EntityName__Id {
    return new __EntityName__Id(UuidValueObject.random().value);
  }
}
```

## String — para campos de texto con validación

```typescript
import { StringValueObject } from '@shared/domain/value-objects/string.value-object';

export class __EntityName____FieldName__ extends StringValueObject {
  constructor(value: string) {
    super(value);
    this.ensureNotEmpty(value);        // quitar si puede estar vacío
    this.ensureMaxLength(value, 255);  // ajustar según negocio
  }

  private ensureNotEmpty(value: string): void {
    if (value.trim().length === 0) {
      throw new __EntityName____FieldName__Empty();
    }
  }

  private ensureMaxLength(value: string, max: number): void {
    if (value.length > max) {
      throw new __EntityName____FieldName__TooLong();
    }
  }
}
```

## Number — para campos numéricos con validación

```typescript
import { NumberValueObject } from '@shared/domain/value-objects/number.value-object';

export class __EntityName____NumericField__ extends NumberValueObject {
  constructor(value: number) {
    super(value);
    this.ensurePositive(value); // quitar si puede ser 0 o negativo
  }

  private ensurePositive(value: number): void {
    if (value <= 0) {
      throw new __EntityName____NumericField__NotPositive();
    }
  }
}
```
