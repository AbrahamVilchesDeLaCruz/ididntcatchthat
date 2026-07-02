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
  return (req.headers['x-request-id'] as string) ?? crypto.randomUUID();
}
```

Importar en todos los controllers que devuelvan envelope:

```typescript
import { resolveRequestId } from '@/shared/infrastructure/http/resolve-request-id';
```

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

  return PaginatedApiResponse.of(
    result.items,
    {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      total_items: result.total,
      total_pages: Math.ceil(result.total / (query.limit ?? 20)),
      has_next_page: (query.page ?? 1) * (query.limit ?? 20) < result.total,
      has_prev_page: (query.page ?? 1) > 1,
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
