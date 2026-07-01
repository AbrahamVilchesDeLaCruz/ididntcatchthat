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
import { FlashcardBulkCreator } from '@/content/flashcard/application/bulk-create/flashcard-bulk-creator';
import { type FlashcardBulkCreatorResult } from '@/content/flashcard/application/bulk-create/response-flashcard-bulk-creator';
import { BulkCreateFlashcardPostPayload } from './bulk-create-flashcard-post.payload';
import { CreateFlashcardPostPayload } from './create-flashcard-post.payload';

const BULK_CREATE_BODY_EXAMPLE: BulkCreateFlashcardPostPayload = {
  flashcards: [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      expression: 'catch up',
      meaning: 'ponerse al día',
      category: 'phrasal_verbs',
      subcategory: 'daily_life',
      ipaNotation: null,
      nativeSpeech: null,
      examples: [
        {
          id: '660e8400-e29b-41d4-a716-446655440001',
          textEn: 'I need to catch up on my emails.',
          textEs: 'Necesito ponerme al día con mis correos.',
          position: 1,
        },
      ],
    } satisfies CreateFlashcardPostPayload,
  ],
};

@ApiTags('flashcards')
@ApiBearerAuth('access-token')
@Controller('flashcards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BulkCreateFlashcardPostController {
  constructor(private readonly creator: FlashcardBulkCreator) {}

  @Post('bulk')
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Bulk create flashcards',
    description:
      'Creates multiple flashcards in one request. Each item follows the same schema as POST /flashcards. Requires admin JWT.',
  })
  @ApiBody({
    type: BulkCreateFlashcardPostPayload,
    examples: {
      default: {
        summary: 'Single-item bulk import',
        value: BULK_CREATE_BODY_EXAMPLE,
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Flashcards created',
    schema: {
      type: 'object',
      properties: {
        created: { type: 'array', items: { type: 'object' } },
        skipped: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  @ApiUnprocessableEntityResponse({
    description: 'Validation error or empty list',
    type: ValidationErrorSwagger,
  })
  async handler(
    @Body() body: BulkCreateFlashcardPostPayload,
    @CurrentUser() user: UserContext,
  ): Promise<FlashcardBulkCreatorResult> {
    return this.creator.execute(
      body.flashcards.map((f) => ({
        id: f.id,
        expression: f.expression,
        meaning: f.meaning,
        category: f.category,
        subcategory: f.subcategory,
        ipaNotation: f.ipaNotation,
        nativeSpeech: f.nativeSpeech,
        examples: f.examples,
        createdBy: user.userId!,
      })),
    );
  }
}
