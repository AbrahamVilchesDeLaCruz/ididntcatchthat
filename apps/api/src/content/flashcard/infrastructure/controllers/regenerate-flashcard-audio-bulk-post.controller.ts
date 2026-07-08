import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { type Request } from 'express';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { RolesGuard } from '@/shared/infrastructure/auth/roles.guard';
import { Roles } from '@/shared/infrastructure/auth/roles.decorator';
import { ApiResponse } from '@/shared/infrastructure/http/response/api-response';
import { resolveRequestId } from '@/shared/infrastructure/http/resolve-request-id';
import { ValidationErrorResponse } from '@/shared/infrastructure/http/response/validation-error.response';
import { FlashcardAudioBulkRegenerator } from '@/content/flashcard/application/regenerate-audio/flashcard-audio-bulk-regenerator';
import { RegenerateFlashcardAudioBulkPostPayload } from './regenerate-flashcard-audio-bulk-post.payload';

@ApiTags('content')
@ApiBearerAuth('access-token')
@SkipThrottle()
@Controller('flashcards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RegenerateFlashcardAudioBulkPostController {
  constructor(
    private readonly bulkRegenerator: FlashcardAudioBulkRegenerator,
  ) {}

  @Post('audio/regenerates')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bulk start flashcard audio generation',
    description:
      'Starts async audio generation for all non-deleted flashcards matching audioStatus (pending or failed) and optional category filters. Requires admin JWT.',
  })
  @ApiOkResponse({ description: 'Number of flashcards queued for generation' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  @ApiUnprocessableEntityResponse({
    description: 'Invalid payload',
    type: ValidationErrorResponse,
  })
  async handler(
    @Body() body: RegenerateFlashcardAudioBulkPostPayload,
    @Req() req: Request,
  ): Promise<ApiResponse<{ triggered: number }>> {
    const data = await this.bulkRegenerator.execute({
      audioStatus: body.audioStatus,
      category: body.category,
      subcategory: body.subcategory,
    });

    return ApiResponse.of(data, resolveRequestId(req));
  }
}
