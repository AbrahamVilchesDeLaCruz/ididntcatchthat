# ADR-023: Gaming BC — Attempt dentro del Aggregate Boundary de Game

- **Estado**: Aceptado
- **Fecha**: 2026-05-28
- **Autores**: Abraham Vilches

---

## Contexto

El BC `gaming` maneja partidas de flashcards. Cada partida (`Game`) contiene una lista de flashcards y registra los intentos (`Attempt`) del usuario sobre cada una.

En la implementación original, `Game` acumula `_attempts` en memoria y `TypeOrmGameRepository.save()` hace un `DELETE + INSERT` de todos los attempts en cada llamada. Esto genera:

- Escrituras innecesarias en base de datos en cada `recordAttempt`
- Acoplamiento entre la persistencia del aggregate y la de sus entidades hijas
- Violación del principio de responsabilidad única en el repositorio

Adicionalmente, el módulo importa `FlashcardEntity` del BC `content` directamente via TypeORM (`forFeature`), violando el aislamiento entre Bounded Contexts.

---

## Decisión

### 1. `Attempt` vive dentro del aggregate boundary de `Game` — NO es un aggregate independiente

`Attempt` **no** se eleva a aggregate propio porque:

- No tiene invariantes de negocio fuera del contexto de `Game`
- No puede existir sin un `Game` — no tiene sentido de negocio aislado
- La única regla de consistencia relevante ("la flashcard tiene que estar en el juego") es **invariante de `Game`**, no de `Attempt`
- No tiene su propio ciclo de vida ni flujo de estados

`Game` es la unidad de consistencia. Mantiene `_attempts` en memoria para poder calcular:
- `pendingFlashcardIds()` — flashcards aún no respondidas
- `complete()` — valida que todas las flashcards fueron respondidas antes de completar la partida

### 2. `Attempt` tiene su propio repositorio — pero no su propio aggregate

Se crea un puerto `AttemptRepository` en `gaming/domain/` y su implementación `TypeOrmAttemptRepository` en `gaming/infrastructure/`. El use case `AttemptRecorder` persiste el attempt nuevo directamente, sin pasar por `TypeOrmGameRepository`.

```
AttemptRecorder.execute(gameId, flashcardId, correct):
  1. game = gameRepository.search(gameId)      ← carga Game con sus attempts (para invariantes)
  2. game.recordAttempt(flashcardId, correct)  ← valida invariante, genera AttemptRecordedEvent
  3. attemptRepository.save(attempt)           ← persiste solo el attempt nuevo
  4. gameRepository.save(game)                 ← persiste estado del Game (sin tocar attempts)
  5. eventBus.publish(game.pullDomainEvents())
```

### 3. `TypeOrmGameRepository.save()` deja de gestionar attempts

- Elimina el `DELETE + INSERT` de attempts
- Los `GameFlashcards` se persisten **solo al crear** — el set no cambia durante la partida
- `search()` sigue cargando attempts via `AttemptRepository` para reconstituir el aggregate

### 4. Cross-BC con `FlashcardEntity` se resuelve con SQL raw

`TypeOrmFlashcardSelector` y `TypeOrmGameFlashcardQuery` reemplazan `Repository<FlashcardEntity>` por `DataSource` con queries SQL raw. `FlashcardEntity` se elimina del `forFeature` de `GamingModule`.

---

## Alternativas descartadas

### A) `pendingFlashcardIds()` como query en repositorio

Trasladar la lógica de "qué flashcards quedan pendientes" al repositorio o al use case.

**Descartado porque**: saca lógica de negocio del dominio y la lleva a infraestructura o aplicación, violando el principio de que el aggregate es responsable de sus propias invariantes.

### B) `Attempt` como aggregate independiente con `POST /attempts`

Modelar `Attempt` con su propio ciclo de vida: `CreateAttemptPostController → AttemptCreator → AttemptCreatedEvent → RecordGameAttemptOnAttemptCreated`.

**Descartado porque**:
- `Attempt` no tiene invariantes propias fuera del contexto de `Game`
- Convierte una acción sobre `Game` en la creación de una entidad independiente — naming incorrecto (`AttemptCreated` vs `AttemptRecorded`)
- Añade un salto de evento innecesario para una operación que es localmente consistente
- La validación de "la flashcard pertenece al game" se pierde o se duplica

### C) `complete()` recibe `answeredFlashcardIds` como parámetro

El use case resuelve los attempts antes de llamar a `complete()` y se los pasa como argumento.

**Descartado porque**: expone al use case como orquestador de lógica de negocio que debería vivir en el aggregate.

---

## Consecuencias

**Positivas**:
- `TypeOrmGameRepository.save()` es idempotente y no hace escrituras destructivas
- El aggregate mantiene todas sus invariantes en dominio
- `GamingModule` deja de depender de `FlashcardEntity` de otro BC
- Separación clara de responsabilidades entre repositorios

**Negativas / trade-offs**:
- `search()` en `TypeOrmGameRepository` sigue cargando attempts para reconstituir el aggregate — si un juego tiene muchos attempts, hay una query adicional. Aceptable para el scope del TFM.
- Se añade un `AttemptRepository` nuevo — pequeño incremento de complejidad estructural justificado por la separación de persistencia.

---

## Referencias

- [ADR-019: Event Bus Strategy](./019-event-bus-strategy.md)
- [Eric Evans — Domain-Driven Design, Cap. 6: Aggregates]
- [Vaughn Vernon — Implementing Domain-Driven Design, Cap. 10: Aggregates]
