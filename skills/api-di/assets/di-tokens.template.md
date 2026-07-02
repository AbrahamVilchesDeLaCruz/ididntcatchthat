# DI Tokens Template

Copy this template when adding dependency injection tokens to a new module.

## File: `{context}/domain/{entity}.repository.ts` (token alongside interface)

```typescript
// The Symbol lives next to the interface it identifies
export interface {Entity}Repository {
  save({entity}: {Entity}): Promise<void>;
  search(id: {Entity}Id): Promise<{Entity} | null>;
  match(criteria: Criteria): Promise<{Entity}[]>;
  // remove() es opcional — añadir solo si el dominio lo requiere
}

export const {ENTITY}_REPOSITORY = Symbol('{Entity}Repository');
```

## File: `{context}/infrastructure/framework/{context}.module.ts` (registration)

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { {Entity}Entity } from '../persistence/{entity}.entity';
import { TypeOrm{Entity}Repository } from '../persistence/typeorm-{entity}.repository';
import { {ENTITY}_REPOSITORY } from '../../domain/{entity}.repository';
import { {Entity}{Verb}er } from '../../application/{verb}/{entity}-{verb}er';
import { {Verb}{Entity}PostController } from '../controllers/{verb}-{entity}-post.controller';
import { SharedModule } from '@/shared/infrastructure/framework/shared.module';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([{Entity}Entity])],
  controllers: [{Verb}{Entity}PostController],
  providers: [
    // Ports
    {
      provide: {ENTITY}_REPOSITORY,
      useClass: TypeOrm{Entity}Repository,
    },
    // Use cases
    {Entity}{Verb}er,
  ],
  // Solo exportar tokens que otros módulos necesitan
  exports: [],
})
export class {Entity}Module {}
```

## Naming convention for tokens

```
{ENTITY}_REPOSITORY        → GAME_REPOSITORY, USER_REPOSITORY
{ENTITY}_QUERY             → GAME_STATS_QUERY, USER_STATS_QUERY (read-only projections)
{ENTITY}_SELECTOR          → FLASHCARD_SELECTOR (domain selectors)
{ENTITY}_PROVIDER          → WEAKEST_FLASHCARD_IDS_PROVIDER (domain providers)
{ENTITY}_SERVICE           → AUDIO_SERVICE (external services)
DOMAIN_EVENT_PUBLISHER     → shared — publica DomainEvent[]
DOMAIN_EVENT_CONSUMER      → shared — consume colas AMQP
LOGGER_SERVICE             → shared — interface Logger
APP_METRICS                → shared — interface AppMetrics
```

## Checklist

- [ ] El token (`Symbol`) está en el mismo archivo que la interfaz
- [ ] La clase concreta (`TypeOrm*`, `Amqp*`) se registra solo en el módulo de infrastructure
- [ ] Las clases concretas **nunca** se exportan — solo el token
- [ ] El use case inyecta por token: `@Inject({ENTITY}_REPOSITORY)`
- [ ] Sin `forwardRef()` si no hay dependencia circular real
