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
import { FlashcardBulkCreator } from '@/content/flashcard/application/bulk-create/flashcard-bulk-creator';
import { BulkCreateFlashcardPostPayload } from './bulk-create-flashcard-post.payload';

@ApiTags('content')
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
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  @ApiUnprocessableEntityResponse({
    description: 'Validation error or empty list',
    type: ValidationErrorResponse,
  })
  async handler(
    @Body() body: BulkCreateFlashcardPostPayload,
    @CurrentUser() user: UserContext,
  ): Promise<void> {
    await this.creator.execute(
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
