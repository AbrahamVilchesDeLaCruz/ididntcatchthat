---
name: api-observability
description: "Logger interface, pino, métricas Prometheus, OTel traces en apps/api/. Trigger: Al añadir logging en use cases, configurar métricas Prometheus, o setup de OpenTelemetry."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "2.0"
---

## When to Use

- Al añadir logging en un use case, subscriber o filter
- Al decidir qué nivel de log usar (info/warn/error/debug)
- Al añadir métricas de negocio custom

> Lee `references/docs.md` para skills relacionadas, ADRs y documentación externa.

> Lee `references/implementations.md` para `PinoLogger`, `MetricsService`, logging en subscribers y en `HttpExceptionFilter`.
> Setup de infraestructura (Loki, Prometheus, Grafana, OTel): ver `resources/setup.md`.

---

## Las 3 señales

| Signal | Qué captura | Storage | Consultado en |
|---|---|---|---|
| Logs | Qué pasó y cuándo | Loki | Grafana |
| Metrics | Cuánto y con qué frecuencia | Prometheus | Grafana |
| Traces | Cómo viajó un request por dentro | Tempo | Grafana |

OpenTelemetry es el SDK que instrumenta y exporta — no es un storage.

---

## `Logger` Interface (domain)

```typescript
// src/shared/domain/logger.ts
export type LogContext = Record<string, unknown>;

export interface Logger {
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: Error, context?: LogContext): void;
  debug(message: string, context?: LogContext): void;
}

export const LOGGER_SERVICE = Symbol('Logger');
```

| Método | Cuándo |
|---|---|
| `info` | Acción de negocio completada (flashcard creada, sesión iniciada) |
| `warn` | Situación inesperada pero recuperable (retry, fallback) |
| `error` | Error que impacta al usuario o rompe el flujo |
| `debug` | Detalle técnico — solo en desarrollo |

---

## `AppMetrics` Interface (domain)

```typescript
// src/shared/domain/app-metrics.ts
export interface AppMetrics {
  increment(metric: string, labels?: Record<string, string>): void;
}

export const APP_METRICS = Symbol('AppMetrics');
```

Solo tiene `increment` — todos los contadores de negocio son `Counter` de Prometheus.
No hay `gauge` ni `histogram` en la interfaz de dominio: el `MetricsInterceptor` gestiona los histogramas HTTP directamente.

| Métrica | Labels | Dónde se incrementa |
|---|---|---|
| `app_flashcards_created_total` | — | `FlashcardCreator` |
| `app_games_started_total` | — | `GameStarter` |
| `app_games_completed_total` | — | `GameCompleter` |
| `app_audio_generated_total` | `provider` | `FlashcardAudioGenerator` |
| `app_auth_logins_total` | `provider` | `UserAuthenticator` |
| `app_auth_registrations_total` | `provider` | `UserRegistrar` |

### Inyección en use case

```typescript
constructor(
  @Inject(LOGGER_SERVICE)
  private readonly logger: Logger,
  @Inject(APP_METRICS)
  private readonly metrics: AppMetrics,
) {}

async execute(request: ...): Promise<...> {
  // ... lógica ...
  this.logger.info('Flashcard created', { flashcardId: id, expression, createdBy });
  this.metrics.increment('app_flashcards_created_total');
}

// Con labels:
this.metrics.increment('app_audio_generated_total', { provider: 'elevenlabs' });
```

> `APP_METRICS` se inyecta igual que `LOGGER_SERVICE` — el módulo `ObservabilityModule` lo exporta como global.

---

## Dónde loguear

### Use Case — eventos de negocio

```typescript
async execute(params: { id: string; phrase: string }): Promise<void> {
  const flashcard = Flashcard.create(params);
  await this.repository.save(flashcard);
  await this.eventBus.publish(flashcard.pullDomainEvents());

  this.logger.info('Flashcard created', {
    flashcardId: params.id,
    phrase: params.phrase,
  });
}
```

### Contexto siempre útil

```typescript
// ✅ Con identificador del aggregate
this.logger.info('Flashcard updated', { flashcardId, userId, field: 'phrase' });
this.logger.error('Audio generation failed', error, { flashcardId, provider: 'elevenlabs' });

// ❌ Sin contexto
this.logger.info('Updated');
this.logger.error(error.message);
```

---

## Reglas

- `Logger` y `AppMetrics` interfaces viven en `shared/domain/` — nunca importar pino, prom-client u OTel en domain/application
- Loguear **eventos de negocio** en use cases (`info`)
- Incrementar métricas de negocio en use cases con `this.metrics.increment('app_<metric>_total')`
- Loguear **errores con el objeto `Error`** completo — preserva stack trace
- **No loguear en controllers** — el filter e interceptor lo hacen automáticamente
- Re-throw en subscribers después de loguear — para retry y DLQ
- `APP_METRICS` se registra en `ObservabilityModule`, no en `SharedModule`

> ADR: [docs/adr/020-observability-strategy.md](../../docs/adr/020-observability-strategy.md)
