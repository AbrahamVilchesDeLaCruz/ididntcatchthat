# Backend Architecture — DDD + Onion Architecture

> Principios y reglas de arquitectura del backend de ididntcatchthat (`apps/api/`).
> Para convenciones de implementación específicas del stack, ver las skills en `apps/api/AGENTS.md`.

---

## Principio fundamental

**Las dependencias siempre apuntan hacia adentro. Las capas internas no saben nada de las externas. Nunca.**

```
┌─────────────────────────────────────┐
│         Infrastructure              │
│   ┌─────────────────────────────┐   │
│   │      Application            │   │
│   │   ┌─────────────────────┐   │   │
│   │   │      Domain         │   │   │
│   │   └─────────────────────┘   │   │
│   └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

| Desde \ Hacia  | Domain | Application | Infrastructure |
| -------------- | ------ | ----------- | -------------- |
| Domain         | ✅     | ❌          | ❌             |
| Application    | ✅     | ✅          | ❌             |
| Infrastructure | ✅     | ✅          | ✅             |

---

## Principios DDD aplicados

**Ubiquitous Language** — Los nombres en el código reflejan el lenguaje del dominio. Si el negocio dice "flashcard", el código dice `Flashcard`, no `Card`, no `Item`, no `Entity`.

**Bounded Contexts** — Unidad mental y de código que representa una parte del negocio. Cada contexto tiene su propio lenguaje, sus propios modelos, y no comparte implementaciones con otros contextos.

**Aggregates** — La Aggregate Root es la única puerta de entrada al dominio. Garantiza invariantes y consistencia interna. Las capas externas solo acceden al dominio a través del aggregate o de domain services.

**Ports & Adapters** — el nombre DDD para [DIP](./engineering-principles.md#d--dependency-inversion-principle). El dominio define interfaces; la infraestructura las implementa.

**Domain Events** — Hechos que ya ocurrieron en el sistema, expresados en pasado (`FlashcardCreated`, `PronunciationAttemptSubmitted`). Permiten comunicación entre Bounded Contexts sin acoplamiento directo.

**Modules** — Concepto de dominio incluido dentro de un Bounded Context. Cuando un Bounded Context tiene múltiples conceptos cohesionados, se dividen en módulos. Cuando solo tiene uno, módulo = contexto.

---

## Capas

### Domain — la capa más interna

Cero dependencias externas. Solo el lenguaje de programación puro.

**Aggregates** — grupos de entidades y Value Objects con una raíz que garantiza invariantes. Son la puerta de entrada al dominio. Exponen factory methods (`create`, `fromPrimitives`) y `toPrimitives`.

**Entities** — conjuntos de Value Objects que tienen sentido como grupo y verifican reglas de negocio relacionadas entre ellos.

**Value Objects** — inmutables, sin identidad, con validación propia. Representan conceptos del dominio con reglas (`FlashcardId`, `PronunciationScore`, `AudioUrl`).

**Repository interfaces (Ports)** — contratos que la infraestructura implementa. No son DAOs. No crecen con métodos específicos de consulta. Métodos permitidos: `match`, `search`, `save`, `remove`.

**Domain Services** — lógica que no pertenece a una sola entidad y se necesita desde más de un caso de uso. Ejemplo: `FlashcardExistVerifier` usado desde creator, updater y remover.

**Domain Events** — hechos del sistema expresados en pasado. El aggregate los registra; la infraestructura los publica.

**Domain Exceptions** — errores de negocio. No son errores HTTP. La infraestructura los mapea a respuestas de protocolo.

### Application — orquestación

Solo importa del dominio. No sabe nada de frameworks, bases de datos ni protocolos.

**Use Cases** — un archivo = una acción del sistema. Orquestan aggregates, domain services y el repository. Reciben primitivos, devuelven primitivos o void.

**DTOs** — objetos de transferencia entre capas. No son entidades de dominio. Definen el contrato de entrada y salida de cada use case.

**Event Handlers / Consumers** — reaccionan a Domain Events ejecutando use cases. Un handler = una reacción a un evento. Son use cases derivados.

### Infrastructure — el mundo exterior

La capa de entrada a la aplicación. Implementa los puertos definidos en el dominio.

**Controllers** — orquestan use cases. Reciben la request del protocolo (HTTP, mensajería, etc.), construyen el DTO, llaman al use case, devuelven la respuesta.

**Repository implementations** — implementan la interfaz del dominio usando el mecanismo de persistencia concreto (SQL, NoSQL, in-memory).

**Mappers** — transforman entre el modelo de persistencia y el dominio, y viceversa. `toDomain` y `toPersistence`.

**Dependency Injection** — el [Composition Root](./engineering-principles.md#5-composition-root) del backend (módulo de NestJS). Registra y conecta las implementaciones con las interfaces. Es infrastructure porque es un detalle de cómo se ensambla el sistema.

**Exception registry** — mapea excepciones de dominio a respuestas de protocolo. El dominio lanza una excepción semántica; la infraestructura la convierte en HTTP 404, 409, etc.

**Event Bus** — publica Domain Events al exterior (mensajería, in-process). Implementa la interfaz definida en dominio o application.

**Infrastructure Services** — servicios que no necesitan interfaz en el dominio (caché, rate-limiting, seguridad, almacenamiento externo). Pueden tener interfaz en dominio si el dominio necesita abstraerse de ellos.

---

## Estructura de carpetas

Los Bounded Contexts viven directamente bajo `src/` — no hay ningún wrapper `contexts/`.

```
src/
├── {bounded-context}/
├── shared/                          ← shared global del sistema
│   ├── domain/                      ← AggregateRoot base, VO base, interfaces globales (Logger)
│   ├── application/                 ← Subscriber base, interfaces de handlers
│   └── infrastructure/              ← conexión DB, EventBus impl, Criteria, DI container, PinoLogger
└── observability/                   ← módulo técnico transversal (no es un BC de dominio)
    ├── application/summary/         ← read port + MetricsSummaryRetriever (admin JSON)
    └── infrastructure/
        ├── controllers/             ← metrics-get + search-metrics-summary-get
        ├── metrics.interceptor.ts   ← MetricsInterceptor (prom-client)
        └── framework/
            └── observability.module.ts
```

### Bounded Context = Módulo (caso simple)

Cuando un Bounded Context tiene un solo concepto, módulo y contexto colapsan. Ejemplos reales: `gaming/`, `progress/`.

```
src/
└── gaming/                    ← contexto = módulo
    ├── application/
    │   └── {verb}/            ← acción (start, complete, record, update)
    │       ├── {use-case}     ← GameStarter
    │       ├── request-{dto}
    │       └── response-{dto}
    ├── domain/
    │   ├── events/
    │   ├── exceptions/
    │   ├── {aggregate}        ← Aggregate Root
    │   ├── {aggregate}.repository
    │   └── {aggregate}-{vo}
    └── infrastructure/
        ├── controllers/
        ├── persistence/       ← implementación del repository + mappers + entidades TypeORM
        ├── selectors/         ← queries de lectura optimizadas (si aplica)
        └── framework/         ← {bc}.module.ts + {bc}-exception-registry.ts + DI providers
```

### Bounded Context con múltiples módulos

Cuando un BC agrupa varios conceptos cohesionados, cada uno tiene su propio módulo. Ejemplos reales: `content/` (con `flashcard/`), `identity/` (con `user/` y `session/`).

```
src/
└── content/                         ← bounded context
    ├── flashcard/                   ← módulo
    │   ├── application/
    │   │   └── {verb}/
    │   ├── domain/
    │   │   ├── events/
    │   │   ├── exceptions/
    │   │   ├── {aggregate}
    │   │   ├── {aggregate}.repository
    │   │   └── {aggregate}-{vo}
    │   └── infrastructure/
    │       ├── controllers/
    │       ├── persistence/
    │       └── {external-service}/  ← ej: ai/, audio/ (adaptadores de servicios externos)
    └── shared/                      ← shared del bounded context
        ├── domain/
        ├── application/
        └── infrastructure/
            └── framework/           ← content.module.ts + content-exception-registry.ts + DI providers
```

---

## Reglas de naming

| Elemento             | Convención                           | Ejemplo                                          |
| -------------------- | ------------------------------------ | ------------------------------------------------ |
| Bounded Context      | singular o compuesto                  | `content/`, `gaming/`, `identity/`, `progress/`  |
| Módulo               | singular                              | `flashcard/`, `user/`, `session/`                |
| Archivos de dominio  | siempre singular                      | `flashcard.ts`, `flashcard-id.ts`                |
| Use Case             | `{Module}{Verb}`                      | `FlashcardCreator`, `GameStarter`                |
| Domain Event         | `{Module}{ActionPast}Event`           | `FlashcardCreatedEvent`, `AttemptRecordedEvent`  |
| Domain Exception     | `{Module}{Problem}`                   | `FlashcardNotFound`, `GameNotFound`              |
| Repository interface | `{Module}Repository`                  | `FlashcardRepository`, `GameRepository`          |
| Domain Service       | `{Module}{Concern}`                   | `FlashcardExistVerifier`                         |
| Controller           | `{Verb}{Module}{Method}Controller`    | `CreateFlashcardPostController`, `GetGameGetController` |
| Repository impl      | `{Tech}{Module}Repository`            | `TypeOrmFlashcardRepository`                     |
| Mapper               | `{Module}Mapper`                      | `FlashcardMapper`                                |
| Subscriber           | `{Verb}{Module}On{Event}`             | `UpdateFlashcardStatsOnAttemptRecorded`           |

---

## Invariantes del dominio

El aggregate es el único que puede garantizar invariantes. Reglas:

- **Ley de Demeter** — un objeto solo habla con sus colaboradores directos. No encadenar llamadas a través de objetos.
- **Tell, don't ask** — decirle al objeto qué hacer, no preguntarle su estado para decidir fuera.
- **Separation of Concerns** — cada clase tiene una sola razón para cambiar.
- **Factory methods** — el aggregate se construye solo a través de `create()` o `fromPrimitives()`. Constructor privado.
- **toPrimitives** — la única forma de serializar el aggregate hacia afuera. No exponer Value Objects directamente a infraestructura.

---

## Comunicación entre Bounded Contexts

- Los Bounded Contexts **no se importan entre sí directamente**
- Comunicación solo a través de **Domain Events** (asíncrona) o del **Shared module** (interfaces y tipos comunes)
- Un evento publicado por el contexto A es consumido por el contexto B sin que A sepa que B existe
- La comunicación síncrona entre contextos es un smell — señal de que los límites están mal definidos

---

## Shared Module

Contiene conocimiento compartido entre todo el sistema:

- **Domain**: AggregateRoot base, Value Object bases, interfaces globales (EventBus, Criteria, Logger)
- **Application**: casos de uso base, interfaces de handlers
- **Infrastructure**: conexión a base de datos, implementación del EventBus, Criteria, contenedor DI, PinoLogger

Regla: si algo es usado por **más de un bounded context**, va a shared. Si solo lo usa uno, es del módulo.

---

## Observability Module

Módulo técnico transversal — no es un Bounded Context de dominio sino infraestructura de plataforma.

Responsabilidades:
- **`MetricsInterceptor`** — intercepta cada request HTTP y registra duración y conteo en prom-client
- **`MetricsGetController`** — expone `GET /metrics` para que Prometheus haga scraping
- **`SearchMetricsSummaryGetController`** — expone `GET /v1/metrics/summary` (admin, envelope JSON)
- **`ObservabilityModule`** — registra el Registry de prom-client, el interceptor global y los controllers

No tiene capa `domain/` — es infraestructura técnica con un read slice en `application/summary/`.

Tokens `METRICS_REGISTRY` y `APP_METRICS` viven en `shared/domain/`. `PrometheusAppMetrics` implementa `AppMetrics` en `shared/infrastructure/metrics/`.
