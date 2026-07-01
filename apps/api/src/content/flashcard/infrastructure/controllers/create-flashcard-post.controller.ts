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
  ApiCreatedResponse,
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
import { ValidationErrorSwagger } from '@/shared/infrastructure/http/response/validation-error.swagger';
import { FlashcardCreator } from '@/content/flashcard/application/create/flashcard-creator';
import { type FlashcardPrimitives } from '@/content/flashcard/domain/flashcard';
import { CreateFlashcardPostPayload } from './create-flashcard-post.payload';

const CREATE_FLASHCARD_BODY_EXAMPLE: CreateFlashcardPostPayload = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  expression: 'catch up',
  meaning: 'ponerse al día',
  category: 'phrasal_verbs',
  subcategory: 'daily_life',
  ipaNotation: '/kætʃ ʌp/',
  nativeSpeech: null,
  examples: [
    {
      id: '660e8400-e29b-41d4-a716-446655440001',
      textEn: 'I need to catch up on my emails.',
      textEs: 'Necesito ponerme al día con mis correos.',
      position: 1,
    },
  ],
};

@ApiTags('flashcards')
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
  @ApiBody({
    type: CreateFlashcardPostPayload,
    examples: {
      default: {
        summary: 'Phrasal verb flashcard',
        value: CREATE_FLASHCARD_BODY_EXAMPLE,
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Flashcard created',
    schema: { type: 'object', description: 'Created flashcard primitives' },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  @ApiUnprocessableEntityResponse({
    description: 'Validation error',
    type: ValidationErrorSwagger,
  })
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
      createdBy: user.userId!,
    });
  }
}
