# Skill: api-observability

## When to Use

- Al añadir logging en un use case, subscriber o filter
- Al decidir qué nivel de log usar (info/warn/error/debug)
- Al añadir métricas de negocio custom
- Setup e infraestructura → ver `resources/`

---

## Las 3 señales — resumen rápido

| Signal | Qué captura | Storage | Consultado en |
|---|---|---|---|
| Logs | Qué pasó y cuándo | Loki | Grafana |
| Metrics | Cuánto y con qué frecuencia | Prometheus | Grafana |
| Traces | Cómo viajó un request por dentro | Tempo | Grafana |

OpenTelemetry es el SDK que instrumenta y exporta las 3 señales — no es un storage.

---

## Logger Interface

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

| Método | Cuándo usarlo |
|---|---|
| `info` | Acción de negocio completada (flashcard creada, sesión iniciada) |
| `warn` | Situación inesperada pero recuperable (retry de RabbitMQ, fallback) |
| `error` | Error que impacta al usuario o rompe el flujo |
| `debug` | Detalle técnico — solo útil en desarrollo |

---

## Dónde y cómo loguear

### Use Case — eventos de negocio

```typescript
@Injectable()
export class CreateFlashcardUseCase {
  constructor(
    @Inject(FLASHCARD_REPOSITORY) private readonly repository: FlashcardRepository,
    @Inject(EVENT_BUS) private readonly eventBus: EventBus,
    @Inject(LOGGER_SERVICE) private readonly logger: Logger,
  ) {}

  async execute(params: { id: string; phrase: string }): Promise<void> {
    const flashcard = Flashcard.create(params);
    await this.repository.save(flashcard);
    await this.eventBus.publish(flashcard.pullDomainEvents());

    this.logger.info('Flashcard created', {
      flashcardId: params.id,
      phrase: params.phrase,
    });
  }
}
```

### Subscriber — eventos procesados y errores

```typescript
async handle(event: DomainEvent): Promise<void> {
  this.logger.info('Processing event', { queue: this.queueName, eventId: event.eventId });

  try {
    await this.useCase.execute({ ... });
  } catch (error) {
    this.logger.error('Handler failed', error as Error, {
      queue: this.queueName,
      eventId: event.eventId,
    });
    throw error; // re-throw — permite retry y DLQ
  }
}
```

### HttpExceptionFilter — errores HTTP (automático)

```typescript
catch(exception: unknown, host: ArgumentsHost): void {
  // ...
  if (status >= 500) {
    this.logger.error('Internal server error', exception as Error, {
      path: request.url,
      method: request.method,
      requestId: request.headers['x-request-id'],
    });
  } else {
    this.logger.warn('Client error', { status, path: request.url });
  }
}
```

### Controllers — NO loguear manualmente

El `HttpExceptionFilter` y el `MetricsInterceptor` lo hacen automáticamente. No añadir logs en controllers.

---

## Contexto del log

El contexto siempre incluye el **identificador del aggregate** afectado:

```typescript
// ✅ Correcto — contexto útil para debugging
this.logger.info('Flashcard updated', { flashcardId, userId, field: 'phrase' });
this.logger.error('Audio generation failed', error, { flashcardId, provider: 'elevenlabs' });

// ❌ Incorrecto — sin contexto
this.logger.info('Updated');
this.logger.error(error.message);
```

---

## Métricas HTTP — automáticas

El `MetricsInterceptor` registra automáticamente en cada request:

- `http_requests_total{method, route, status}` — contador
- `http_request_duration_seconds{method, route}` — histograma de latencia

No añadir métricas HTTP manualmente en controllers.

## Métricas de negocio — custom

Para métricas específicas del dominio (ej: flashcards creadas por día):

```typescript
// src/shared/infrastructure/metrics/metrics.service.ts
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('flashcards_created_total') private readonly counter: Counter,
  ) {}

  incrementFlashcardsCreated(): void {
    this.counter.inc();
  }
}
```

---

## PinoLogger — implementación concreta

```typescript
// src/shared/infrastructure/logger/pino-logger.ts
import { Injectable } from '@nestjs/common';
import pino from 'pino';
import { Logger, LogContext } from '@shared/domain/logger';

@Injectable()
export class PinoLogger implements Logger {
  private readonly logger = pino({
    level: process.env.LOG_LEVEL ?? 'info',
    formatters: { level: (label) => ({ level: label }) },
    timestamp: pino.stdTimeFunctions.isoTime,
  });

  info(message: string, context?: LogContext): void {
    this.logger.info(context ?? {}, message);
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(context ?? {}, message);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.logger.error({ ...context, err: error }, message);
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(context ?? {}, message);
  }
}
```

Registro en `SharedModule`:

```typescript
{ provide: LOGGER_SERVICE, useClass: PinoLogger }
```

---

## Rules

- `Logger` interface vive en `shared/domain/` — nunca importar pino u OTel en domain/application
- Loguear **eventos de negocio** en use cases (`info`)
- Loguear **errores con el objeto `Error`** completo — no solo el mensaje (preserva stack trace)
- **No loguear en controllers** — el filter e interceptor lo hacen automáticamente
- Re-throw en subscribers después de loguear — para que RabbitMQ gestione retry y DLQ
- El contexto siempre incluye el ID del aggregate afectado

> Setup de infraestructura (Loki, Prometheus, Grafana, OTel): ver `resources/setup.md`
> Decisión arquitectónica: ver `resources/adr.md` o [ADR 020](../../docs/adr/020-observability-strategy.md)
