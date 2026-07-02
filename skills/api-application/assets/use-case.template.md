# Use Case Template

Copy this template when creating a new use case. Replace all `{Placeholders}`.

## File: `{context}/application/{verb}/{entity}-{verb}er.ts`

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { {Entity}Repository, {ENTITY}_REPOSITORY } from '@/{context}/shared/domain/{entity}.repository';
import { EventBus, EVENT_BUS } from '@/shared/domain/event-bus';
import { Logger, LOGGER_SERVICE } from '@/shared/domain/logger';
import { {Entity}Id } from '@/{context}/domain/{entity}-id';
import { {Entity}NotFound } from '@/{context}/domain/{entity}-not-found';
import { type Request{Entity}{Verb}er } from './request-{entity}-{verb}er';

@Injectable()
export class {Entity}{Verb}er {
  constructor(
    @Inject({ENTITY}_REPOSITORY) private readonly repository: {Entity}Repository,
    @Inject(EVENT_BUS) private readonly eventBus: EventBus,
    @Inject(LOGGER_SERVICE) private readonly logger: Logger,
  ) {}

  async execute(request: Request{Entity}{Verb}er): Promise<void> {
    const {entity} = await this.repository.search(new {Entity}Id(request.id));
    if (!{entity}) throw new {Entity}NotFound(request.id);

    {entity}.{action}(/* ... */);

    await this.repository.save({entity});
    await this.eventBus.publish({entity}.pullDomainEvents());

    this.logger.info('{Entity} {verb}ed', { {entity}Id: request.id });
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

## Checklist

- [ ] Un use case = una responsabilidad — si hace más de una cosa, separar
- [ ] Recibe `Request*` type — nunca payload HTTP ni Criteria directamente
- [ ] `repository.save()` **antes** de `eventBus.publish()`
- [ ] `logger.info()` al final del flujo feliz
- [ ] Domain errors lanzados desde el aggregate/VO, no desde el use case
- [ ] `@Inject(TOKEN)` para todos los puertos — nunca inyección por tipo concreto
