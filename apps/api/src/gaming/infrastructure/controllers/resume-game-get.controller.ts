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
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import { ApiResponse } from '@/shared/infrastructure/http/response/api-response';
import { resolveRequestId } from '@/shared/infrastructure/http/resolve-request-id';
import { ValidationErrorSwagger } from '@/shared/infrastructure/http/response/validation-error.swagger';
import {
  GameResumer,
  type ResponseGameResumer,
} from '@/gaming/application/resume/game-resumer';

@ApiTags('games')
@ApiBearerAuth('access-token')
@Controller('games')
@UseGuards(JwtAuthGuard)
export class ResumeGameGetController {
  constructor(private readonly resumer: GameResumer) {}

  @Get(':id/resume')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resume a paused game session',
    description:
      'Returns game state and flashcard ids to continue a paused session. Requires authenticated user JWT.',
  })
  @ApiOkResponse({ description: 'Paused game state for resumption' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiUnprocessableEntityResponse({
    description: 'Validation error',
    type: ValidationErrorSwagger,
  })
  async handler(
    @Param('id') id: string,
    @CurrentUser() user: UserContext,
    @Req() req: Request,
  ): Promise<ApiResponse<ResponseGameResumer>> {
    const data = await this.resumer.execute({
      gameId: id,
      userId: user.userId!,
    });
    return ApiResponse.of(data, resolveRequestId(req));
  }
}
