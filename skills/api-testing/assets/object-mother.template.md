# Template — Object Mother

Reemplazá `__EntityName__` y `__module__` por los valores reales.

La jerarquía es: `MotherCreator` → Mothers de primitivos → Mothers de VOs → Mother del aggregate.
**Faker solo vive en `MotherCreator`** — nunca importar faker directamente en un Mother de VO o aggregate.

## MotherCreator (shared — ya existe, no recrear)

```typescript
// test/contexts/shared/domain/mother-creator.ts
import { faker, type Faker } from '@faker-js/faker';

export class MotherCreator {
  static random(): Faker {
    return faker;
  }
}
```

## Mother de VO

```typescript
// test/contexts/__module__/domain/__entity-name__-id-mother.ts
import { UuidMother } from '../../shared/domain/uuid-mother';
import { __EntityName__Id } from 'src/contexts/__module__/domain/__entity-name__-id';

export class __EntityName__IdMother {
  static random(): __EntityName__Id {
    return new __EntityName__Id(UuidMother.random());
  }

  static withValue(value: string): __EntityName__Id {
    return new __EntityName__Id(value);
  }
}
```

## Mother del Aggregate

```typescript
// test/contexts/__module__/domain/__entity-name__-mother.ts
import { __EntityName__ } from 'src/contexts/__module__/domain/__entity-name__';
import { __EntityName__IdMother } from './__entity-name__-id-mother';
import { StringMother } from '../../shared/domain/string-mother';

type __EntityName__Primitives = {
  id: string;
  // añadir campos aquí
};

type Overrides = Partial<__EntityName__Primitives>;

export class __EntityName__Mother {

  // Valores aleatorios — acepta overrides parciales
  static random(overrides?: Overrides): __EntityName__ {
    return __EntityName__.fromPrimitives({
      id: __EntityName__IdMother.random().value,
      // añadir campos usando Mothers de VO aquí
      ...overrides,
    });
  }

  // Valores explícitos — tests con datos controlados
  static create(primitives: __EntityName__Primitives): __EntityName__ {
    return __EntityName__.fromPrimitives(primitives);
  }

  // Reconstruye desde request — tests de use case
  static from(request: Request__EntityName__Creator): __EntityName__ {
    return __EntityName__.fromPrimitives({ ...request });
  }
}
```
