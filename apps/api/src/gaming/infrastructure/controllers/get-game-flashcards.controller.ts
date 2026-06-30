import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { type Request } from 'express';
import { AnyAuthGuard } from '@/shared/infrastructure/auth/any-auth.guard';
import { ApiResponse } from '@/shared/infrastructure/http/response/api-response';
import { resolveRequestId } from '@/shared/infrastructure/http/resolve-request-id';
import { GameFlashcardsFetcher } from '@/gaming/application/fetch-flashcards/game-flashcards-fetcher';
import { type GameFlashcardDto } from '@/gaming/domain/game-flashcard-query';

@ApiTags('games')
@Controller('games')
@UseGuards(AnyAuthGuard)
export class GetGameFlashcardsController {
  constructor(private readonly fetcher: GameFlashcardsFetcher) {}

  @Get(':gameId/flashcards')
  @ApiOperation({ summary: 'Get all flashcards for a game session' })
  @SwaggerApiResponse({
    status: 200,
    description: 'List of flashcards ordered by position',
  })
  @SwaggerApiResponse({ status: 404, description: 'Game not found' })
  async handler(
    @Param('gameId') gameId: string,
    @Req() req: Request,
  ): Promise<ApiResponse<GameFlashcardDto[]>> {
    const data = await this.fetcher.execute({ gameId });
    return ApiResponse.of(data, resolveRequestId(req));
  }
}
