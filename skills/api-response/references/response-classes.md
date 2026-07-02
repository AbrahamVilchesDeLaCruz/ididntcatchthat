# Response Classes — Reference

## `ApiResponse<T>` y `PaginatedApiResponse<T>`

```typescript
// shared/infrastructure/http/response/api-response.ts
export class ApiResponse<T> {
  constructor(
    readonly data: T,
    readonly meta: ResponseMeta,
  ) {}

  static of<T>(data: T, requestId: string): ApiResponse<T> {
    return new ApiResponse(data, {
      timestamp: new Date().toISOString(),
      request_id: requestId,
    });
  }
}

export class PaginatedApiResponse<T> {
  constructor(
    readonly data: T[],
    readonly pagination: PaginationMeta,
    readonly meta: ResponseMeta,
  ) {}

  static of<T>(
    data: T[],
    pagination: PaginationMeta,
    requestId: string,
  ): PaginatedApiResponse<T> {
    return new PaginatedApiResponse(data, pagination, {
      timestamp: new Date().toISOString(),
      request_id: requestId,
    });
  }
}

export interface ResponseMeta {
  timestamp: string;
  request_id: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}
```

## `resolveRequestId`

```typescript
// shared/infrastructure/http/resolve-request-id.ts
import { type Request } from 'express';

export function resolveRequestId(req: Request): string {
  const header = req.headers['x-request-id'];
  if (typeof header === 'string' && header.trim()) {
    return header;
  }
  return crypto.randomUUID();
}
```

> `header` can be a `string[]` when the same header is sent multiple times, so a plain `as string` cast is unsafe.  The real implementation checks `typeof === 'string'` before using the value and rejects empty strings via `.trim()`.  Never use the inline cast pattern shown in the anti-patterns section.

Importar en todos los controllers que devuelvan envelope:

```typescript
import { resolveRequestId } from '@/shared/infrastructure/http/resolve-request-id';
```

## `apiEnvelopeSchema` — Swagger helper

Use this helper when documenting query responses with `@ApiOkResponse`:

```typescript
// shared/infrastructure/http/response/api-envelope.schema.ts
import { apiEnvelopeSchema } from '@/shared/infrastructure/http/response/api-envelope.schema';

@ApiOkResponse({
  description: 'Ranking entries with viewer context',
  schema: apiEnvelopeSchema({
    entries: [{ rank: 1, userId: 'user-uuid', score: 12 }],
    currentUser: { rank: 1, userId: 'user-uuid', score: 12 },
  }),
})
```

This generates an OpenAPI `{ data, meta }` schema fragment from an example value.  Only needed when the generic Swagger types are insufficient to describe the response shape.

---

## Controllers — ejemplos completos

### Query con paginación (GET)

```typescript
@Get()
@ApiOperation({ summary: 'Search games' })
async handler(
  @Query() query: SearchGamesGetQuery,
  @Req() req: Request,
  @CurrentUser() user: UserContext,
): Promise<PaginatedApiResponse<GamePrimitives>> {
  const result = await this.searcher.execute({ userId: user.userId, ...query });

  const limit = result.pageSize;
  const totalPages = Math.ceil(result.total / limit);

  return PaginatedApiResponse.of(
    result.data,
    {
      page: result.page,
      limit,
      total_items: result.total,
      total_pages: totalPages,
      has_next_page: result.page < totalPages,
      has_prev_page: result.page > 1,
    },
    resolveRequestId(req),
  );
}
```

### Command con datos (POST → 201)

```typescript
@Post()
@HttpCode(HttpStatus.CREATED)
@ApiCreatedResponse({ description: 'Game created with id and flashcard ids' })
async handler(
  @Req() req: Request,
  @Body() body: StartGamePostPayload,
  @CurrentUser() user: UserContext,
): Promise<ApiResponse<ResponseGameStarter>> {
  const data = await this.starter.execute({
    userId: user.userId ?? null,
    mode: body.mode,
    cardCount: body.cardCount,
  });
  return ApiResponse.of(data, resolveRequestId(req));
}
```

### Command puro (PATCH/DELETE → 204)

```typescript
@Patch(':id')
@HttpCode(HttpStatus.NO_CONTENT)
async handler(@Param('id') id: string, @Body() payload: UpdateFlashcardPatchPayload): Promise<void> {
  await this.updater.execute({ id, ...payload });
}

@Delete(':id')
@HttpCode(HttpStatus.NO_CONTENT)
async handler(@Param('id') id: string): Promise<void> {
  await this.deleter.execute({ id });
}
```

### Excepción legítima: endpoints de auth (tokens + cookies)

Auth endpoints (`/auth/login`, `/auth/register`, `/auth/guest`, `/auth/refresh`) do **not** use `ApiResponse<T>`.  They return raw data because:
- They manage `Set-Cookie` headers for the `refreshToken` via `@Res({ passthrough: true })`
- The client only needs `{ accessToken: string }` — wrapping in an envelope adds no value

```typescript
@Post('login')
@HttpCode(HttpStatus.OK)
async handler(
  @Body() body: LoginAuthPostPayload,
  @Res({ passthrough: true }) res: Response,
): Promise<{ accessToken: string }> {
  const result = await this.authenticator.execute({ ... });
  res.cookie('refreshToken', result.refreshTokenId, { httpOnly: true, ... });
  return { accessToken: result.accessToken };
}
```

This is the only valid exemption from the envelope rule.  Non-auth endpoints that skip `ApiResponse` are a bug.
