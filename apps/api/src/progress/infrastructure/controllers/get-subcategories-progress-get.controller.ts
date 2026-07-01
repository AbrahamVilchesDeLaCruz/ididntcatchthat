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
import { SubcategoryProgressFinder } from '@/progress/application/find/subcategory-progress-finder';
import { type SubcategoryProgressDto } from '@/progress/domain/subcategory-progress.query';

@ApiTags('progress')
@ApiBearerAuth('access-token')
@Controller('progress')
@UseGuards(JwtAuthGuard)
export class GetSubcategoriesProgressGetController {
  constructor(private readonly finder: SubcategoryProgressFinder) {}

  @Get('subcategories')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get subcategory progress for the current user',
    description:
      'Returns per-subcategory completion and accuracy for the authenticated user.',
  })
  @ApiOkResponse({
    description: 'Subcategory progress list',
    schema: {
      type: 'object',
      required: ['data', 'meta'],
      properties: {
        data: {
          type: 'array',
          items: { type: 'object', description: 'Subcategory progress DTO' },
        },
        meta: API_ENVELOPE_META_SCHEMA,
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  async handler(
    @CurrentUser() user: UserContext,
    @Req() req: Request,
  ): Promise<ApiResponse<SubcategoryProgressDto[]>> {
    const data = await this.finder.execute({ userId: user.userId! });
    return ApiResponse.of(data, resolveRequestId(req));
  }
}
