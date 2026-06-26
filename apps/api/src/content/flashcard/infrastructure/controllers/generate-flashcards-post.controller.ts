import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { RolesGuard } from '@/shared/infrastructure/auth/roles.guard';
import { Roles } from '@/shared/infrastructure/auth/roles.decorator';
import { AiFlashcardDraftGenerator } from '@/content/flashcard/application/generate-drafts/ai-flashcard-draft-generator';
import { type ResponseAiFlashcardDraftGenerator } from '@/content/flashcard/application/generate-drafts/request-ai-flashcard-draft-generator';
import { GenerateFlashcardsPostPayload } from './generate-flashcards-post.payload';

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GenerateFlashcardsPostController {
  constructor(private readonly generator: AiFlashcardDraftGenerator) {}

  @Post('generate-flashcards')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate flashcard drafts with AI for a category and subcategory',
  })
  @ApiResponse({ status: 200, description: 'Drafts generated successfully' })
  @ApiResponse({ status: 422, description: 'Validation error' })
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
