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
import { FlashcardBulkCreator } from '@/content/flashcard/application/bulk-create/flashcard-bulk-creator';
import { type FlashcardBulkCreatorResult } from '@/content/flashcard/application/bulk-create/flashcard-bulk-creator';
import { BulkCreateFlashcardPostPayload } from './bulk-create-flashcard-post.payload';

@ApiTags('flashcards')
@Controller('flashcards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BulkCreateFlashcardPostController {
  constructor(private readonly creator: FlashcardBulkCreator) {}

  @Post('bulk')
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bulk create flashcards' })
  @ApiResponse({ status: 201, description: 'Flashcards created' })
  @ApiResponse({ status: 422, description: 'Validation error or empty list' })
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
