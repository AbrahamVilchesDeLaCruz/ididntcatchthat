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
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import { ApiResponse } from '@/shared/infrastructure/http/response/api-response';
import { resolveRequestId } from '@/shared/infrastructure/http/resolve-request-id';
import { ValidationErrorResponse } from '@/shared/infrastructure/http/response/validation-error.response';
import {
  GameSummaryFinder,
  type ResponseGameSummaryFinder,
} from '@/gaming/application/summary/game-summary-finder';

@ApiTags('gaming')
@ApiBearerAuth('access-token')
@Controller('games')
@UseGuards(AnyAuthGuard)
export class FindGameSummaryGetController {
  constructor(private readonly finder: GameSummaryFinder) {}

  @Get(':id/summary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get game session summary',
    description:
      'Returns accuracy, streak and progress stats for an in-progress or completed game. Accepts JWT or guest token.',
  })
  @ApiOkResponse({ description: 'Game summary stats' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiUnprocessableEntityResponse({
    description: 'Validation error',
    type: ValidationErrorResponse,
  })
  async handler(
    @Param('id') id: string,
    @CurrentUser() user: UserContext,
    @Req() req: Request,
  ): Promise<ApiResponse<ResponseGameSummaryFinder>> {
    const data = await this.finder.execute({
      gameId: id,
      userId: user.userId ?? null,
    });
    return ApiResponse.of(data, resolveRequestId(req));
  }
}
