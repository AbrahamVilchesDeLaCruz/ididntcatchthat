import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { RolesGuard } from '@/shared/infrastructure/auth/roles.guard';
import { Roles } from '@/shared/infrastructure/auth/roles.decorator';
import { ValidationErrorResponse } from '@/shared/infrastructure/http/response/validation-error.response';
import { ApiResponse } from '@/shared/infrastructure/http/response/api-response';
import { resolveRequestId } from '@/shared/infrastructure/http/resolve-request-id';
import { type Request } from 'express';
import { AiFlashcardDraftGenerator } from '@/content/flashcard/application/generate-drafts/ai-flashcard-draft-generator';
import { type ResponseAiFlashcardDraftGenerator } from '@/content/flashcard/application/generate-drafts/request-ai-flashcard-draft-generator';
import { GenerateFlashcardsPostPayload } from './generate-flashcards-post.payload';

@ApiTags('content')
@ApiBearerAuth('access-token')
@Controller('flashcards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GenerateFlashcardsPostController {
  constructor(private readonly generator: AiFlashcardDraftGenerator) {}

  @Post('drafts')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate flashcard drafts with AI for a category and subcategory',
    description:
      'Uses AI to propose flashcard drafts for backoffice review before bulk import. Requires admin JWT.',
  })
  @ApiOkResponse({
    description: 'Drafts generated successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  @ApiUnprocessableEntityResponse({
    description: 'Validation error',
    type: ValidationErrorResponse,
  })
  async handler(
    @Req() req: Request,
    @Body() body: GenerateFlashcardsPostPayload,
  ): Promise<ApiResponse<ResponseAiFlashcardDraftGenerator>> {
    const data = await this.generator.execute({
      category: body.category,
      subcategory: body.subcategory,
      count: body.count,
      prompt: body.prompt,
    });
    return ApiResponse.of(data, resolveRequestId(req));
  }
}
