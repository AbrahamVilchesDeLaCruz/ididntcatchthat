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

- `Logger` interface vive en `shared/domain/` — nunca importar pino u OTel en domain/application
- Loguear **eventos de negocio** en use cases (`info`)
- Loguear **errores con el objeto `Error`** completo — preserva stack trace
- **No loguear en controllers** — el filter e interceptor lo hacen automáticamente
- Re-throw en subscribers después de loguear — para retry y DLQ

> ADR: [docs/adr/020-observability-strategy.md](../../docs/adr/020-observability-strategy.md)
