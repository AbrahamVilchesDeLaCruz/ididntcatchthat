import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { type Request } from 'express';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import { API_ENVELOPE_META_SCHEMA } from '@/shared/infrastructure/http/response/api-envelope.schema';
import { ApiResponse } from '@/shared/infrastructure/http/response/api-response';
import { resolveRequestId } from '@/shared/infrastructure/http/resolve-request-id';
import { ModuleProgressFinder } from '@/progress/application/find/module-progress-finder';
import { type ModuleProgressWithStudyPrimitives } from '@/progress/domain/module-progress';

@ApiTags('progress')
@ApiBearerAuth('access-token')
@Controller('progress')
@UseGuards(JwtAuthGuard)
export class SearchModulesProgressGetController {
  constructor(private readonly finder: ModuleProgressFinder) {}

  @Get('modules')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search module progress for the current user',
    description:
      'Returns module-level progress merged with study session data for the authenticated user.',
  })
  @ApiOkResponse({
    description: 'Module progress list',
    schema: {
      type: 'object',
      required: ['data', 'meta'],
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            description: 'Module progress with study primitives',
          },
        },
        meta: API_ENVELOPE_META_SCHEMA,
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  async handler(
    @CurrentUser() user: UserContext,
    @Req() req: Request,
  ): Promise<ApiResponse<ModuleProgressWithStudyPrimitives[]>> {
    const data = await this.finder.execute({ userId: user.userId! });
    return ApiResponse.of(data, resolveRequestId(req));
  }
}
