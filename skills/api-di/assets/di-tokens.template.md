# DI Tokens Template

Copy this template when adding dependency injection tokens to a new module.

## File: `{context}/shared/domain/{entity}.repository.ts` (token alongside interface)

```typescript
// The Symbol lives next to the interface it identifies
export interface {Entity}Repository {
  search(id: {Entity}Id): Promise<{Entity} | null>;
  match(criteria: Criteria): Promise<{Entity}[]>;
  save({entity}: {Entity}): Promise<void>;
  remove(id: {Entity}Id): Promise<void>;
}

export const {ENTITY}_REPOSITORY = Symbol('{Entity}Repository');
```

## File: `{context}/infrastructure/framework/{context}.module.ts` (registration)

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { {Entity}Entity } from '../persistence/{entity}.entity';
import { TypeOrm{Entity}Repository } from '../persistence/typeorm-{entity}.repository';
import { {ENTITY}_REPOSITORY } from '../../shared/domain/{entity}.repository';
import { {Entity}{Verb}er } from '../../application/{verb}/{entity}-{verb}er';
import { {Verb}{Entity}PostController } from '../controllers/{verb}-{entity}-post.controller';

@Module({
  imports: [TypeOrmModule.forFeature([{Entity}Entity])],
  controllers: [{Verb}{Entity}PostController],
  providers: [
    // Use cases
    {Entity}{Verb}er,
    // Ports
    {
      provide: {ENTITY}_REPOSITORY,
      useClass: TypeOrm{Entity}Repository,
    },
  ],
})
export class {Entity}Module {}
```

## Shared module token (exportable to other BCs)

```typescript
// {context}/shared/infrastructure/{context}-shared.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([{Entity}Entity])],
  providers: [
    {
      provide: {ENTITY}_REPOSITORY,
      useClass: TypeOrm{Entity}Repository,
    },
  ],
  exports: [{ENTITY}_REPOSITORY], // ← solo el token, nunca la clase concreta
})
export class {Entity}SharedModule {}
```

## Naming convention for tokens

```
{ENTITY}_REPOSITORY        → FLASHCARD_REPOSITORY, GAME_REPOSITORY
{ENTITY}_SERVICE           → AUDIO_SERVICE (external services)
EVENT_BUS                  → shared — EventBus interface
DOMAIN_EVENT_PUBLISHER     → shared — alias for EVENT_BUS in use cases
DOMAIN_EVENT_CONSUMER      → shared — DomainEventConsumer interface
LOGGER_SERVICE             → shared — Logger interface
APP_METRICS                → shared — MetricsService interface
```

## Checklist

- [ ] El token (`Symbol`) está en el mismo archivo que la interfaz
- [ ] La clase concreta (`TypeOrm*`, `Amqp*`) se registra solo en el módulo de infrastructure
- [ ] Las clases concretas **nunca** se exportan — solo el token
- [ ] El use case inyecta por token: `@Inject({ENTITY}_REPOSITORY)`
- [ ] Sin `forwardRef()` si no hay dependencia circular real
