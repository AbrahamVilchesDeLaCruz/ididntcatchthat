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
import { PausedGamesLister } from '@/gaming/application/list-paused/paused-games-lister';
import { type GamePrimitives } from '@/gaming/domain/game';
import { SearchGamesGetQuery } from './search-games-get.query';

@ApiTags('gaming')
@ApiBearerAuth('access-token')
@Controller('games')
@UseGuards(JwtAuthGuard)
export class SearchGamesGetController {
  constructor(private readonly lister: PausedGamesLister) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search games for the current user',
    description:
      'Returns game sessions for the authenticated user filtered by status. Use `status=paused` to list resumable sessions.',
  })
  @ApiOkResponse({ description: 'List of games matching the status filter' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiUnprocessableEntityResponse({
    description: 'Validation error',
    type: ValidationErrorResponse,
  })
  async handler(
    @Query() query: SearchGamesGetQuery,
    @CurrentUser() user: UserContext,
    @Req() req: Request,
  ): Promise<ApiResponse<GamePrimitives[]>> {
    const data = await this.lister.execute({
      userId: user.userId!,
      status: query.status,
    });
    return ApiResponse.of(data, resolveRequestId(req));
  }
}
