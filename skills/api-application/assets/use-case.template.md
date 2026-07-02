# Use Case Template

Copy this template when creating a new use case. Replace all `{Placeholders}`.

## File: `{context}/application/{verb}/{entity}-{verb}er.ts`

```typescript
import { Injectable, Inject } from '@nestjs/common';
import {
  type {Entity}Repository,
  {ENTITY}_REPOSITORY,
} from '@/{context}/domain/{entity}.repository';
import {
  type DomainEventPublisher,
  DOMAIN_EVENT_PUBLISHER,
} from '@/shared/domain/domain-event-publisher';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';
import { type AppMetrics, APP_METRICS } from '@/shared/domain/app-metrics';
import { {Entity}Id } from '@/{context}/domain/{entity}-id';
import { {Entity}NotFound } from '@/{context}/domain/exceptions/{entity}-not-found';
import { type Request{Entity}{Verb}er } from './request-{entity}-{verb}er';
import { type Response{Entity}{Verb}er } from './response-{entity}-{verb}er';

export type { Request{Entity}{Verb}er, Response{Entity}{Verb}er };

@Injectable()
export class {Entity}{Verb}er {
  constructor(
    @Inject({ENTITY}_REPOSITORY) private readonly repository: {Entity}Repository,
    @Inject(DOMAIN_EVENT_PUBLISHER) private readonly publisher: DomainEventPublisher,
    @Inject(LOGGER_SERVICE) private readonly logger: Logger,
    @Inject(APP_METRICS) private readonly metrics: AppMetrics,
  ) {}

  async execute(request: Request{Entity}{Verb}er): Promise<Response{Entity}{Verb}er> {
    const {entity} = await this.repository.search(new {Entity}Id(request.id));
    if (!{entity}) throw new {Entity}NotFound(request.id);

    {entity}.{action}(/* ... */);

    await this.repository.save({entity});
    await this.publisher.publish({entity}.pullDomainEvents());

    this.logger.info('{Entity} {verb}ed', { {entity}Id: request.id });
    this.metrics.increment('app_{entities}_{verb}ed_total');

    return {entity}.toPrimitives();
  }
}
```

## File: `{context}/application/{verb}/request-{entity}-{verb}er.ts`

```typescript
export type Request{Entity}{Verb}er = {
  id: string;
  // Add request fields here
};
```

## File: `{context}/application/{verb}/response-{entity}-{verb}er.ts`

Only create this file when the use case returns a complex type (not primitives).

```typescript
export type Response{Entity}{Verb}er = {
  // Add response fields here
};
```

## Checklist

- [ ] Un use case = una responsabilidad — si hace más de una cosa, separar
- [ ] Recibe `Request*` type — nunca payload HTTP ni Criteria directamente
- [ ] `repository.save()` **antes** de `publisher.publish()`
- [ ] `publisher.publish()` presente — los use cases de write siempre publican eventos
- [ ] `logger.info()` al final del flujo feliz
- [ ] `metrics.increment()` con nombre `app_{entities}_{verb}ed_total`
- [ ] Domain errors lanzados desde el aggregate/VO, no desde el use case
- [ ] `@Inject(TOKEN)` para todos los puertos — nunca inyección por tipo concreto
- [ ] Re-export de `Request*` y `Response*` en el mismo archivo del use case
