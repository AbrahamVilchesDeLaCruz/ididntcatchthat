# Engineering Principles — ididntcatchthat

> Principios de diseño que aplican a **todo el sistema** — frontend y backend.
> Estos no son reglas arbitrarias. Cada uno existe para resolver un problema concreto que aparece cuando un sistema crece.
> Entender el **por qué** es tan importante como conocer el qué.

---

## 1. SOLID

### S — Single Responsibility Principle

Una clase o función tiene **una sola razón para cambiar**.

**Por qué importa**: cuando una unidad mezcla responsabilidades, un cambio en una afecta las demás. Los bugs se dispersan, los tests se complican, y el código se vuelve frágil.

En el backend:

- Un Use Case = una acción del sistema. `FlashcardCreator` no crea y no busca.
- Un Domain Service resuelve un problema de dominio concreto. `FlashcardExistVerifier` solo verifica existencia.
- Un Controller solo orquesta: recibe la request, llama al use case, devuelve la response.

En el frontend:

- Un Container = una fuente de datos. No mezcla queries de recursos distintos.
- Un hook del pod encapsula un grupo cohesionado de estado. `useFlashcardFilters` no gestiona también el tooltip.
- Un Component renderiza y gestiona estado de UI. No fetchea datos.

```ts
// ❌ Viola SRP: el use case hace demasiado
class FlashcardCreator {
  async execute(command: CreateFlashcardCommand) {
    const exists = await this.repository.searchById(command.id)
    if (exists) throw new FlashcardAlreadyExists()
    const flashcard = Flashcard.create(...)
    await this.repository.save(flashcard)
    await this.emailService.sendConfirmation(...)   // efecto secundario no relacionado
    await this.cacheService.invalidate(...)         // detalle de infra
  }
}

// ✅ Correcto: cada responsabilidad en su lugar
class FlashcardCreator {
  async execute(command: CreateFlashcardCommand) {
    await this.flashcardExistVerifier.verify(command.id)  // domain service
    const flashcard = Flashcard.create(...)
    await this.repository.save(flashcard)
    await this.eventBus.publish(flashcard.pullDomainEvents())  // el subscriber maneja el resto
  }
}
```

---

### O — Open/Closed Principle

**Abierto a extensión, cerrado a modificación.**

**Por qué importa**: modificar código que ya funciona introduce regresiones. Extender sin modificar mantiene lo que ya funciona intacto.

En el backend:

- Añadir un nuevo proveedor (LLM, storage, email) = crear un nuevo adaptador que implementa el puerto. El use case no se toca.
- Los Domain Events permiten añadir comportamiento derivado sin modificar el use case original.

En el frontend:

- Añadir un nuevo filtro al pod = nuevo estado en el hook de filtros. El Component no cambia su estructura.
- Añadir una nueva acción al Container = nueva mutation. El Component recibe un nuevo callback.

```ts
// ❌ Viola OCP: hay que modificar el use case para cada nuevo canal
class FlashcardCreator {
  async execute(command: CreateFlashcardCommand) {
    // ...
    if (channel === 'email') await this.emailService.send(...)
    if (channel === 'push') await this.pushService.send(...)
  }
}

// ✅ Correcto: el use case publica un evento; cada subscriber extiende el comportamiento
// Nuevo canal = nuevo subscriber. FlashcardCreator no se toca nunca más.
class OnFlashcardCreatedSendEmail { ... }
class OnFlashcardCreatedSendPushNotification { ... }
```

---

### L — Liskov Substitution Principle

**Cualquier implementación de una interfaz debe ser sustituible sin alterar el comportamiento esperado.**

**Por qué importa**: si no se cumple, las abstracciones son falsas. Los tests usan mocks que no se comportan como la implementación real, y los bugs aparecen solo en producción.

En el backend:

- `TypeOrmFlashcardRepository` e `InMemoryFlashcardRepository` son intercambiables. Los tests usan la versión en memoria; producción usa TypeORM. El use case no nota la diferencia.
- Un adaptador no puede añadir precondiciones extra ni devolver tipos distintos a los definidos en el puerto.

En el frontend:

- Un componente que acepta `onClick?: () => void` no puede requerir internamente que ese callback devuelva un valor específico. Si lo hace, rompe el contrato.

---

### I — Interface Segregation Principle

**Los clientes no deben depender de interfaces que no usan.**

**Por qué importa**: interfaces gordas generan acoplamiento innecesario. Un cambio en un método que no uses te fuerza a actualizar tu implementación.

En el backend:

- El repositorio no crece con métodos específicos de un caso de uso. Si `FlashcardCreator` solo necesita `save()` y `match()`, no contamines la interfaz con `findByDeckOrderedByScore()`.
- Si un servicio externo tiene muchas capacidades, define puertos pequeños y específicos por caso de uso.

En el frontend:

- Las props de un Component no incluyen datos que el Component no usa. Si un sub-componente solo necesita `title` y `onClose`, no le pases el objeto completo.

---

### D — Dependency Inversion Principle

**Los módulos de alto nivel no dependen de los de bajo nivel. Ambos dependen de abstracciones.**

**Por qué importa**: el acoplamiento a implementaciones concretas hace imposible testear en aislamiento y dificulta el cambio tecnológico.

En el backend:

- El use case depende de `FlashcardRepository` (abstracción), no de `TypeOrmFlashcardRepository` (implementación).
- La inyección ocurre en el Composition Root, nunca dentro de las clases de dominio o aplicación.

En el frontend:

- El Container depende de hooks (`useFlashcards`, `useCreateFlashcard`), no de `axios` ni de `fetch` directamente.
- Los Components dependen de callbacks tipados, no de stores ni contextos concretos.

```ts
// ❌ Viola DIP: instancia la dependencia concreta
class FlashcardCreator {
  private repository = new TypeOrmFlashcardRepository();
}

// ✅ Correcto: recibe la abstracción por constructor
class FlashcardCreator {
  constructor(private readonly repository: FlashcardRepository) {}
}
```

---

## 2. Ley de Demeter y Tell Don't Ask

### Ley de Demeter

**Solo habla con tus amigos inmediatos.** Un objeto no debe navegar la estructura interna de otro para obtener datos.

```ts
// ❌ Viola Demeter: navega tres niveles
const score = attempt.getResult().getScore().getValue();

// ✅ Correcto: el agregado expone lo necesario
const score = attempt.currentScore();
```

### Tell, Don't Ask

**No preguntes el estado de un objeto para decidir qué hacer. Dile qué hacer y deja que él decida.**

```ts
// ❌ Ask: sacas el estado y decides fuera
if (flashcard.getStatus() === "active") {
  flashcard.setStatus("archived");
  flashcard.setArchivedAt(new Date());
}

// ✅ Tell: le decís qué hacer, él gestiona su invariante
flashcard.archive();
// internamente Flashcard.archive() verifica que está activo,
// actualiza el estado, registra la fecha y emite FlashcardArchivedEvent
```

**Por qué importa en DDD**: las reglas de negocio viven en el agregado, no dispersas en use cases o servicios. Si el estado se puede leer y modificar desde fuera, las invariantes no están garantizadas.

**En el frontend**: los hooks del pod aplican el mismo principio. El Component no pregunta el estado del filtro para decidir qué renderizar — el hook expone el estado ya procesado y handlers para actuar sobre él.

---

## 3. TDD — Test-Driven Development

### El ciclo

```
Red → Green → Refactor
```

1. **Red** — escribir el test que falla. Solo el test, nada de implementación.
2. **Green** — escribir el mínimo código para que el test pase. Sin optimizar.
3. **Refactor** — limpiar el código manteniendo los tests en verde.

**Por qué importa**: TDD no es solo una técnica de testing — es una técnica de diseño. Escribir el test primero obliga a pensar en la interfaz antes que en la implementación. El resultado es código más desacoplado, con interfaces más limpias y responsabilidades más claras.

### Lo que TDD revela

- Si un test es difícil de escribir, la clase tiene demasiadas dependencias → viola SRP o DIP.
- Si necesitás muchos mocks para testear una unidad, está acoplada a demasiadas cosas.
- Si el test es ilegible, el diseño de la interfaz pública es confuso.

### Pirámide de tests

```
         /\
        /E2E\          ← pocos, lentos, flujos críticos completos
       /──────\
      / Integr \       ← medianos, validan que las piezas encajan
     /──────────\
    /    Unit    \     ← muchos, rápidos, una sola responsabilidad
   /______________\
```

**Unit**: una sola clase o función en aislamiento. Dependencias mockeadas. Rápidos. Son la base.

**Integration**: varias piezas juntas. En el backend: use case + repository real (in-memory o base de datos de test). En el frontend: Container + Component + MSW.

**E2E**: el sistema completo desde la perspectiva del usuario. Solo para flujos críticos. Lentos y costosos de mantener.

### Qué testear en cada capa

| Capa | Qué testear | Cómo |
|---|---|---|
| Domain (backend) | **No se testea directamente** — se ejercita como efecto de los tests de Use Cases | Object Mothers con faker para construir datos de entrada |
| Application (backend) | Use Cases | Unit — repository in-memory, dependencias mockeadas |
| Infrastructure (backend) | Repository implementations | Integration — base de datos real o in-memory |
| Hooks del pod (frontend) | Lógica de estado, handlers | Unit — `renderHook` |
| Mappers (frontend/backend) | Transformación de datos | Unit — función pura |
| Component (frontend) | Renderizado, interacciones de UI | Integration — sin queries reales |
| Container (frontend) | Flujo completo con datos | Integration — HTTP mockeado con MSW |
| Flujos críticos | Registro, login, acción principal | E2E |

**Por qué el Domain no se testea directamente**: los agregados, Value Objects y Domain Services no tienen sentido testeados en aislamiento — su comportamiento cobra significado en el contexto de un caso de uso. Si `Flashcard.create()` lanza una excepción de dominio, eso se verifica en el test del Use Case que lo invoca, no en un test unitario de `Flashcard`.

### Object Mother — datos de test

El Object Mother es la única forma de construir entidades de dominio en los tests. Nunca construir objetos de prueba ad-hoc en cada test.

La jerarquía tiene tres niveles. Faker solo vive en `MotherCreator` — si se cambia de librería, solo se toca en dos lugares: `MotherCreator` y los Mothers de tipo primitivo.

```
MotherCreator          ← faker vive aquí. Único punto de cambio de librería.
      ↓
StringMother           ← métodos semánticos que llaman a MotherCreator
UuidMother
NumberMother
      ↓
FlashcardIdMother      ← Mother del VO, llama a UuidMother
FlashcardFrontMother   ← Mother del VO, llama a StringMother
      ↓
FlashcardMother        ← compone los Mothers de los VOs
```

```ts
// shared/domain/__mothers__/MotherCreator.ts
import { faker, type Faker } from '@faker-js/faker';

export class MotherCreator {
  static random(): Faker {
    return faker;
  }
}
```

```ts
// shared/domain/__mothers__/StringMother.ts
import { MotherCreator } from './MotherCreator';

export class StringMother {
  static random(): string {
    return MotherCreator.random().lorem.word();
  }

  static sentence(): string {
    return MotherCreator.random().lorem.sentence();
  }

  static ofLength(length: number): string {
    return MotherCreator.random().string.alpha({ length });
  }
}
```

```ts
// shared/domain/__mothers__/UuidMother.ts
import { MotherCreator } from './MotherCreator';

export class UuidMother {
  static random(): string {
    return MotherCreator.random().string.uuid();
  }
}
```

```ts
// flashcard/domain/__mothers__/FlashcardIdMother.ts
import { UuidMother } from '@shared/domain/__mothers__/UuidMother';
import { FlashcardId } from '../flashcard-id';

export class FlashcardIdMother {
  static random(): FlashcardId {
    return new FlashcardId(UuidMother.random());
  }

  static withValue(value: string): FlashcardId {
    return new FlashcardId(value);
  }
}
```

```ts
// flashcard/domain/__mothers__/FlashcardMother.ts
import { FlashcardIdMother } from './FlashcardIdMother';
import { FlashcardFrontMother } from './FlashcardFrontMother';
import { Flashcard } from '../flashcard';

export class FlashcardMother {
  static random(overrides?: Partial<FlashcardPrimitives>): Flashcard {
    return Flashcard.fromPrimitives({
      id: FlashcardIdMother.random().value,
      frontText: FlashcardFrontMother.random().value,
      backText: FlashcardFrontMother.random().value,
      difficulty: 'medium',
      ...overrides,
    });
  }

  static withDifficulty(difficulty: Difficulty): Flashcard {
    return FlashcardMother.random({ difficulty });
  }
}
```

Beneficios:
- Faker solo aparece en `MotherCreator` — cambio de librería = un solo archivo
- Los Mothers de tipo primitivo (`StringMother`, `UuidMother`) son el segundo punto de cambio si la API de la librería cambia
- Los tests son legibles y los cambios en el dominio se actualizan en un solo lugar
- Los datos aleatorios detectan edge cases que los datos fijos no detectarían

### Reglas de TDD en este proyecto

- Los tests se escriben **antes** de la implementación — no después.
- Un test debe tener una sola razón para fallar.
- El nombre del test describe el comportamiento esperado, no la implementación: `it('throws FlashcardNotFound when flashcard does not exist')`, no `it('calls repository.match')`.
- No mockear lo que no controlás (no mockear `Date`, `Math.random` directamente — usar abstracciones).
- Un test que nunca falla no prueba nada — verificar que el test falla antes de implementar.

---

## 4. Separation of Concerns

**Cada módulo, clase o función tiene una responsabilidad claramente delimitada. Lo que cambia junto, vive junto. Lo que cambia por razones distintas, vive separado.**

Manifestaciones concretas en el proyecto:

| Concern                       | Dónde vive                               |
| ----------------------------- | ---------------------------------------- |
| Reglas de negocio             | Domain (backend)                         |
| Orquestación de casos de uso  | Application (backend)                    |
| Detalles de protocolo e infra | Infrastructure (backend)                 |
| Estado del servidor y caché   | TanStack Query / hooks de api (frontend) |
| Estado de UI                  | hooks del pod / Component (frontend)     |
| Routing y contexto global     | Container (frontend)                     |
| Transformación de datos       | Mappers (frontend y backend)             |

---

## 5. Composition Root

**Las dependencias se ensamblan en un único punto del sistema.** Las clases no crean sus propias dependencias — las reciben.

**Por qué importa**: si cada clase instancia sus dependencias, el sistema es imposible de testear y de modificar. El Composition Root es el único lugar que conoce las implementaciones concretas.

En el backend: el contenedor de DI (módulo de NestJS, `container.ts`, etc.) es el Composition Root.

En el frontend: el `QueryClient`, los providers de Zustand y los wrappers de contexto son el Composition Root. Los componentes nunca instancian servicios directamente.

---

## 6. Immutability by default

**Preferir estructuras inmutables. Mutar el estado solo cuando sea necesario y de forma explícita.**

- Los Value Objects son inmutables. Una operación sobre un VO devuelve uno nuevo, no modifica el existente.
- En el frontend, el estado de los hooks se actualiza a través de los handlers — nunca mutando directamente.
- Los DTOs y ViewModels son de solo lectura (`Readonly<T>` o `as const` donde aplica).

**Por qué importa**: la mutabilidad inesperada es una de las fuentes más comunes de bugs difíciles de reproducir. La inmutabilidad hace el flujo de datos predecible.

---

## 7. Explicit over implicit

**Hacer las cosas explícitas aunque sea más verboso.** Los efectos ocultos, la magia y las convenciones no documentadas son deuda técnica.

- Los tipos son explícitos — no `any`, no inferencia cuando el tipo no es obvio.
- Los contratos entre capas (DTOs, interfaces, props) son explícitos — no objetos genéricos.
- Los errores se lanzan explícitamente con tipos concretos — no strings, no `console.error`.
- En el frontend, las props del Component tienen una interface explícita — no `props: any`, no spread sin tipar.
