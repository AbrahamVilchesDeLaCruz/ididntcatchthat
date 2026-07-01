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
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { RolesGuard } from '@/shared/infrastructure/auth/roles.guard';
import { Roles } from '@/shared/infrastructure/auth/roles.decorator';
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import { ValidationErrorResponse } from '@/shared/infrastructure/http/response/validation-error.response';
import { FlashcardCreator } from '@/content/flashcard/application/create/flashcard-creator';
import { CreateFlashcardPostPayload } from './create-flashcard-post.payload';

@ApiTags('content')
@ApiBearerAuth('access-token')
@Controller('flashcards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CreateFlashcardPostController {
  constructor(private readonly creator: FlashcardCreator) {}

  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a flashcard',
    description:
      'Creates a new flashcard and triggers async AI completion for examples, phonetics and audio. Requires admin JWT.',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  @ApiUnprocessableEntityResponse({
    description: 'Validation error',
    type: ValidationErrorResponse,
  })
  async handler(
    @Body() body: CreateFlashcardPostPayload,
    @CurrentUser() user: UserContext,
  ): Promise<void> {
    await this.creator.execute({
      id: body.id,
      expression: body.expression,
      meaning: body.meaning,
      category: body.category,
      subcategory: body.subcategory,
      ipaNotation: body.ipaNotation,
      nativeSpeech: body.nativeSpeech,
      examples: body.examples,
      createdBy: user.userId!,
    });
  }
}
