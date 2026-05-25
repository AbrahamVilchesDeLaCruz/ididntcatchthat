import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { RolesGuard } from '@/shared/infrastructure/auth/roles.guard';
import { Roles } from '@/shared/infrastructure/auth/roles.decorator';
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import { FlashcardUpdater } from '@/content/flashcard/application/update/flashcard-updater';
import { type FlashcardPrimitives } from '@/content/flashcard/domain/flashcard';
import { UpdateFlashcardPatchPayload } from './update-flashcard-patch.payload';

@ApiTags('flashcards')
@Controller('flashcards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UpdateFlashcardPatchController {
  constructor(private readonly updater: FlashcardUpdater) {}

  @Patch(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a flashcard' })
  @ApiResponse({ status: 200, description: 'Flashcard updated' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Flashcard not found' })
  async handler(
    @Param('id') id: string,
    @Body() body: UpdateFlashcardPatchPayload,
    @CurrentUser() user: UserContext,
  ): Promise<FlashcardPrimitives> {
    return this.updater.execute({
      id,
      requesterId: user.userId,
      requesterRole: user.type,
      fields: {
        expression: body.expression,
        meaning: body.meaning,
        category: body.category,
        subcategory: body.subcategory,
        ipaNotation: body.ipaNotation,
        nativeSpeech: body.nativeSpeech,
        examples: body.examples,
      },
    });
  }
}
