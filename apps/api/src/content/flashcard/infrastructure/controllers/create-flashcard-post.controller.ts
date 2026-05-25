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
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import { FlashcardCreator } from '@/content/flashcard/application/create/flashcard-creator';
import { type FlashcardPrimitives } from '@/content/flashcard/domain/flashcard';
import { CreateFlashcardPostPayload } from './create-flashcard-post.payload';

@ApiTags('flashcards')
@Controller('flashcards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CreateFlashcardPostController {
  constructor(private readonly creator: FlashcardCreator) {}

  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a flashcard' })
  @ApiResponse({ status: 201, description: 'Flashcard created' })
  @ApiResponse({ status: 422, description: 'Validation error' })
  async handler(
    @Body() body: CreateFlashcardPostPayload,
    @CurrentUser() user: UserContext,
  ): Promise<FlashcardPrimitives> {
    return this.creator.execute({
      id: body.id,
      expression: body.expression,
      meaning: body.meaning,
      category: body.category,
      subcategory: body.subcategory,
      ipaNotation: body.ipaNotation,
      nativeSpeech: body.nativeSpeech,
      examples: body.examples,
      createdBy: user.userId,
    });
  }
}
