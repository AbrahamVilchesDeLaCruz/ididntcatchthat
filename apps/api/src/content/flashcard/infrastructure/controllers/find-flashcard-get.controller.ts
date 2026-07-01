import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { type Request } from 'express';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { RolesGuard } from '@/shared/infrastructure/auth/roles.guard';
import { Roles } from '@/shared/infrastructure/auth/roles.decorator';
import { ApiResponse } from '@/shared/infrastructure/http/response/api-response';
import { resolveRequestId } from '@/shared/infrastructure/http/resolve-request-id';
import { FlashcardFinder } from '@/content/flashcard/application/find/flashcard-finder';
import { type FlashcardPrimitives } from '@/content/flashcard/domain/flashcard';

@ApiTags('flashcards')
@ApiBearerAuth('access-token')
@Controller('flashcards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FindFlashcardGetController {
  constructor(private readonly finder: FlashcardFinder) {}

  @Get(':id')
  @Roles('admin')
  @ApiOperation({
    summary: 'Find a flashcard by id',
    description: 'Returns a single flashcard by UUID. Requires admin JWT.',
  })
  @ApiOkResponse({
    description: 'Flashcard found',
    schema: {
      type: 'object',
      required: ['data', 'meta'],
      properties: {
        data: { type: 'object', description: 'Flashcard primitives' },
        meta: {
          type: 'object',
          required: ['timestamp', 'request_id'],
          properties: {
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2026-06-30T12:00:00.000Z',
            },
            request_id: { type: 'string', example: 'req_abc123' },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  @ApiNotFoundResponse({ description: 'Flashcard not found' })
  async handler(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ApiResponse<FlashcardPrimitives>> {
    const data = await this.finder.execute(id);
    return ApiResponse.of(data, resolveRequestId(req));
  }
}
