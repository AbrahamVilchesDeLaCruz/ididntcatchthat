# BC Audit Checklist

Use this checklist when auditing an existing bounded context or designing a new one.

## Phase 1 — Scope & Boundaries

- [ ] The BC has a single ubiquitous language — no term means two things
- [ ] The BC owns its data — no direct DB access from other BCs
- [ ] Cross-BC communication goes through domain events or API calls — never shared repositories
- [ ] The BC name reflects a business capability, not a technical layer (`gaming`, not `game-service`)

## Phase 2 — Domain Layer

- [ ] All business rules live in aggregates or domain services
- [ ] No `@Injectable()`, `@Column()`, or framework imports in `domain/`
- [ ] Value Objects are immutable — no setters
- [ ] Domain Errors extend `DomainError` base class
- [ ] Aggregates call `this.record()` for every state change — domain events are complete
- [ ] `fromPrimitives()` factory method exists in each aggregate

## Phase 3 — Application Layer

- [ ] One use case per file — single responsibility
- [ ] Use cases receive `Request*` type — never raw HTTP payloads
- [ ] All ports injected by token — `@Inject(TOKEN)` pattern
- [ ] `repository.save()` before `eventBus.publish()`
- [ ] No business logic in subscribers — they delegate to a use case
- [ ] Domain services are stateless (or managed by NestJS with `@Injectable()`)

## Phase 4 — Infrastructure Layer

- [ ] One controller per action (`StartGamePostController`, not `GameController`)
- [ ] Controllers have Swagger decorators: `@ApiTags`, `@ApiOperation`, response decorators
- [ ] TypeORM entities have `Entity` suffix — differ from domain aggregates
- [ ] `toDomain()` and `toEntity()` are private — TypeORM entities never escape the repo
- [ ] `match()` applies ALL fields of `Criteria`: filters, order, limit, offset
- [ ] Exception registry registered in `onModuleInit()`

## Phase 5 — DI & Modules

- [ ] Tokens are `Symbol` — defined next to the interface
- [ ] Module uses `forFeature([...entities])` for TypeORM registration
- [ ] Shared BC module exports only tokens — never concrete classes
- [ ] No circular imports between BCs

## Phase 6 — Events

- [ ] Event class has `static readonly EVENT_NAME`
- [ ] `eventName()` instance method returns `EVENT_NAME`
- [ ] `fromPrimitives()` static method exists for AMQP deserialization
- [ ] Subscriber queue name follows: `{bc}.{action}_on_{event_past_verb}`
- [ ] Subscribers handle idempotency (Option A: natural check, Option B: inbox table)

## Phase 7 — Testing

- [ ] Use case tests use `mock<Repository>()` — no concrete adapters
- [ ] Object Mothers exist for every aggregate and request type
- [ ] `container.reset()` in `beforeEach`
- [ ] `jest.useFakeTimers()` when aggregate depends on `new Date()`

## Debt Score

Count unchecked items:
- 0–2: Healthy BC
- 3–5: Minor debt — schedule cleanup
- 6–10: Significant debt — plan refactor sprint
- 11+: Critical — discuss architectural redesign
