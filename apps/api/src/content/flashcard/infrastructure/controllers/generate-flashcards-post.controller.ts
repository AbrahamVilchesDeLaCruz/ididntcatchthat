import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
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
import { ValidationErrorSwagger } from '@/shared/infrastructure/http/response/validation-error.swagger';
import { AiFlashcardDraftGenerator } from '@/content/flashcard/application/generate-drafts/ai-flashcard-draft-generator';
import { type ResponseAiFlashcardDraftGenerator } from '@/content/flashcard/application/generate-drafts/request-ai-flashcard-draft-generator';
import { GenerateFlashcardsPostPayload } from './generate-flashcards-post.payload';

const GENERATE_FLASHCARDS_BODY_EXAMPLE: GenerateFlashcardsPostPayload = {
  category: 'phrasal_verbs',
  subcategory: 'daily_life',
  count: 5,
  prompt: 'Common phrasal verbs about work and daily routines',
};

@ApiTags('ai')
@ApiBearerAuth('access-token')
@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GenerateFlashcardsPostController {
  constructor(private readonly generator: AiFlashcardDraftGenerator) {}

  @Post('generate-flashcards')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate flashcard drafts with AI for a category and subcategory',
    description:
      'Uses AI to propose flashcard drafts for backoffice review before bulk import. Requires admin JWT.',
  })
  @ApiBody({
    type: GenerateFlashcardsPostPayload,
    examples: {
      default: {
        summary: 'Generate 5 phrasal verb drafts',
        value: GENERATE_FLASHCARDS_BODY_EXAMPLE,
      },
    },
  })
  @ApiOkResponse({
    description: 'Drafts generated successfully',
    schema: {
      type: 'object',
      properties: {
        drafts: { type: 'array', items: { type: 'object' } },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  @ApiUnprocessableEntityResponse({
    description: 'Validation error',
    type: ValidationErrorSwagger,
  })
  async handler(
    @Body() body: GenerateFlashcardsPostPayload,
  ): Promise<ResponseAiFlashcardDraftGenerator> {
    return this.generator.execute({
      category: body.category,
      subcategory: body.subcategory,
      count: body.count,
      prompt: body.prompt,
    });
  }
}
