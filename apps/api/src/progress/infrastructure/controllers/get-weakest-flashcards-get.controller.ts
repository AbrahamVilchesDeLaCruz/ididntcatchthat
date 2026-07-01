import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
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
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import { ApiResponse } from '@/shared/infrastructure/http/response/api-response';
import { resolveRequestId } from '@/shared/infrastructure/http/resolve-request-id';
import { ValidationErrorResponse } from '@/shared/infrastructure/http/response/validation-error.response';
import { WeakestFlashcardSearcher } from '@/progress/application/search/weakest-flashcard-searcher';
import { type WeakestFlashcardDto } from '@/progress/domain/weakest-flashcard.query';
import { GetWeakestFlashcardsGetQuery } from './get-weakest-flashcards-get.query';

@ApiTags('progress')
@ApiBearerAuth('access-token')
@Controller('progress')
@UseGuards(JwtAuthGuard)
export class GetWeakestFlashcardsGetController {
  constructor(private readonly searcher: WeakestFlashcardSearcher) {}

  @Get('flashcards/weakest')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get weakest flashcards for the current user',
    description:
      'Returns flashcards with the lowest accuracy for targeted review. Optional limit query parameter (1–50, default 10).',
  })
  @ApiOkResponse({ description: 'Weakest flashcards list' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiUnprocessableEntityResponse({
    description: 'Invalid limit query parameter',
    type: ValidationErrorResponse,
  })
  async handler(
    @CurrentUser() user: UserContext,
    @Query() query: GetWeakestFlashcardsGetQuery,
    @Req() req: Request,
  ): Promise<ApiResponse<WeakestFlashcardDto[]>> {
    const data = await this.searcher.execute({
      userId: user.userId!,
      limit: query.limit,
    });
    return ApiResponse.of(data, resolveRequestId(req));
  }
}
