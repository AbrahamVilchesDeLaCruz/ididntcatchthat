# Template — Value Objects

Reemplazá `__EntityName__` y `__FieldName__` por los nombres reales.

## UUID — para IDs de aggregates

Los IDs de aggregates siempre extienden `UuidValueObject` (no `StringValueObject`).
La validación del formato UUID se hace **antes** del `super()`.

```typescript
import { UuidValueObject } from '@/shared/domain/uuid-value-object';
import { __EntityName__IdInvalid } from './__bc__/domain/exceptions/__entity-name__-id-invalid';

export class __EntityName__Id extends UuidValueObject {
  constructor(value: string) {
    if (!UuidValueObject.isValid(value)) {
      throw new __EntityName__IdInvalid(value);
    }
    super(value);
  }

  static generate(): __EntityName__Id {
    return new __EntityName__Id(UuidValueObject.random());
  }
}
```

> `UuidValueObject.random()` devuelve `string` (no un VO), así que se pasa directamente al constructor.

## String — para campos de texto con validación

```typescript
import { StringValueObject } from '@/shared/domain/string-value-object';
import { __EntityName____FieldName__Empty } from './exceptions/__entity-name__-__field-name__-empty';
import { __EntityName____FieldName__TooLong } from './exceptions/__entity-name__-__field-name__-too-long';

export class __EntityName____FieldName__ extends StringValueObject {
  private static readonly MAX_LENGTH = 255; // ajustar según negocio

  constructor(value: string) {
    super(value);
    this.ensureNotEmpty(value);
    this.ensureMaxLength(value);
  }

  private ensureNotEmpty(value: string): void {
    if (!value?.trim()) {
      throw new __EntityName____FieldName__Empty();
    }
  }

  private ensureMaxLength(value: string): void {
    if (value.length > __EntityName____FieldName__.MAX_LENGTH) {
      throw new __EntityName____FieldName__TooLong();
    }
  }
}
```
