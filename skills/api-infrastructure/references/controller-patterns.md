# Controller Patterns — Reference

## Controller completo con Swagger

```typescript
// gaming/infrastructure/controllers/start-game-post.controller.ts
@ApiTags('gaming')
@ApiBearerAuth('access-token')
@Controller('games')
@UseGuards(AnyAuthGuard)
export class StartGamePostController {
  constructor(private readonly starter: GameStarter) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Start a new game session',
    description: 'Creates a game with the selected mode, module and card count.',
  })
  @ApiCreatedResponse({ description: 'Game created with id and flashcard ids' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiUnprocessableEntityResponse({
    description: 'Invalid mode, module or card count',
    type: ValidationErrorResponse,
  })
  async handler(
    @Req() req: Request,
    @Body() body: StartGamePostPayload,
    @CurrentUser() user: UserContext,
  ): Promise<ApiResponse<ResponseGameStarter>> {
    const data = await this.starter.execute({
      userId: user.userId ?? null,
      mode: body.mode,
      module: body.module ?? null,
      subcategory: body.subcategory ?? null,
      cardCount: body.cardCount,
      source: body.source,
    });
    return ApiResponse.of(data, resolveRequestId(req));
  }
}
```

## Payload con Swagger

```typescript
// gaming/infrastructure/controllers/start-game-post.payload.ts
export class StartGamePostPayload {
  @ApiProperty({ description: 'Game mode', enum: ['flashcard', 'study'] })
  @IsString()
  @IsNotEmpty()
  mode: string;

  @ApiPropertyOptional({ description: 'Learning module' })
  @IsOptional()
  @IsString()
  module?: string;

  @ApiPropertyOptional({ description: 'Subcategory' })
  @IsOptional()
  @IsString()
  subcategory?: string;

  @ApiProperty({ description: 'Number of flashcards', example: 10 })
  @IsInt()
  @Min(1)
  @Max(50)
  cardCount: number;

  @ApiPropertyOptional({ description: 'Selection source', enum: ['catalog', 'weakest'] })
  @IsOptional()
  @IsString()
  source?: string;
}
```

## Query GET con paginación

```typescript
// gaming/infrastructure/controllers/search-games-stats-get.query.ts
export class SearchGamesGetQuery {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ enum: ['flashcard', 'study'] })
  @IsOptional()
  @IsString()
  mode?: string;
}
```

## Controller de GET con paginación

```typescript
@ApiTags('gaming')
@ApiBearerAuth('access-token')
@Controller('games')
@UseGuards(JwtAuthGuard)
export class SearchGamesGetController {
  constructor(private readonly searcher: GamesSearcher) {}

  @Get()
  @ApiOperation({ summary: 'Search games with filters and pagination' })
  @ApiOkResponse({ description: 'Paginated list of games' })
  async handler(
    @Req() req: Request,
    @Query() query: SearchGamesGetQuery,
    @CurrentUser() user: UserContext,
  ): Promise<PaginatedApiResponse<GamePrimitives>> {
    const result = await this.searcher.execute({
      userId: user.userId!,
      mode: query.mode,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });

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
}
```

## Controller command puro (PATCH/DELETE)

```typescript
@Patch(':id')
@HttpCode(HttpStatus.NO_CONTENT)
@ApiOperation({ summary: 'Update flashcard' })
@ApiNoContentResponse({ description: 'Updated successfully' })
async handler(
  @Param('id') id: string,
  @Body() body: UpdateFlashcardPatchPayload,
): Promise<void> {
  await this.updater.execute({ id, ...body });
}

@Delete(':id')
@HttpCode(HttpStatus.NO_CONTENT)
@ApiNoContentResponse({ description: 'Deleted successfully' })
async handler(@Param('id') id: string): Promise<void> {
  await this.deleter.execute({ id });
}
```
