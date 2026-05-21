# Template — Object Mother

Reemplazá `__EntityName__` y `__module__` por los valores reales.

```typescript
import { faker } from '@faker-js/faker';
import { __EntityName__ } from '@__module__/domain/__entity-name__';

// Uso:
//   __EntityName__Mother.random()
//   __EntityName__Mother.random({ phrase: 'fixed value' })
//   __EntityName__Mother.create({ id: 'uuid', phrase: 'value' })

type __EntityName__Primitives = {
  id: string;
  // añadir campos aquí
};

type Overrides = Partial<__EntityName__Primitives>;

export class __EntityName__Mother {

  // Valores aleatorios — acepta overrides parciales
  static random(overrides?: Overrides): __EntityName__ {
    return __EntityName__.fromPrimitives({
      id: faker.string.uuid(),
      // añadir campos con faker aquí
      ...overrides,
    });
  }

  // Valores explícitos — tests con datos controlados
  static create(primitives: __EntityName__Primitives): __EntityName__ {
    return __EntityName__.fromPrimitives(primitives);
  }

  // Reconstruye desde primitivos — tests de repositorio
  static from(primitives: __EntityName__Primitives): __EntityName__ {
    return __EntityName__.fromPrimitives(primitives);
  }
}
```
