# Observability Implementations — Reference

## `PinoLogger` — implementación concreta

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

## `MetricsService` — métricas de negocio custom

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

## Logging en Subscriber — con retry

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

## Logging en HttpExceptionFilter

```typescript
catch(exception: unknown, host: ArgumentsHost): void {
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

## Métricas HTTP automáticas

El `MetricsInterceptor` registra en cada request:

- `http_requests_total{method, route, status}` — contador
- `http_request_duration_seconds{method, route}` — histograma de latencia

No añadir métricas HTTP manualmente en controllers.
