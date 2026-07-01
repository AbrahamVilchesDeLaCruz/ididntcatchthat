import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { type Request } from 'express';
import { AnyAuthGuard } from '@/shared/infrastructure/auth/any-auth.guard';
import { ApiResponse } from '@/shared/infrastructure/http/response/api-response';
import { resolveRequestId } from '@/shared/infrastructure/http/resolve-request-id';
import { ValidationErrorResponse } from '@/shared/infrastructure/http/response/validation-error.response';
import { GameFlashcardsFetcher } from '@/gaming/application/fetch-flashcards/game-flashcards-fetcher';
import { type GameFlashcardDto } from '@/gaming/domain/game-flashcard-query';

@ApiTags('gaming')
@ApiBearerAuth('access-token')
@Controller('games')
@UseGuards(AnyAuthGuard)
export class GetGameFlashcardsGetController {
  constructor(private readonly fetcher: GameFlashcardsFetcher) {}

  @Get(':gameId/flashcards')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all flashcards for a game session',
    description:
      'Returns flashcards ordered by position for the given game. Accepts JWT or guest token.',
  })
  @ApiOkResponse({
    description: 'List of flashcards ordered by position',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiUnprocessableEntityResponse({
    description: 'Validation error',
    type: ValidationErrorResponse,
  })
  async handler(
    @Param('gameId') gameId: string,
    @Req() req: Request,
  ): Promise<ApiResponse<GameFlashcardDto[]>> {
    const data = await this.fetcher.execute({ gameId });
    return ApiResponse.of(data, resolveRequestId(req));
  }
}
