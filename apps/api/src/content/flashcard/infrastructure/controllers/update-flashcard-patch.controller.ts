import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
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
import { FlashcardUpdater } from '@/content/flashcard/application/update/flashcard-updater';
import { UpdateFlashcardPatchPayload } from './update-flashcard-patch.payload';

@ApiTags('content')
@ApiBearerAuth('access-token')
@Controller('flashcards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UpdateFlashcardPatchController {
  constructor(private readonly updater: FlashcardUpdater) {}

  @Patch(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Update a flashcard',
    description:
      'Partially updates flashcard fields. Only provided fields are changed. Requires admin JWT.',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Admin role required or access denied' })
  @ApiNotFoundResponse({ description: 'Flashcard not found' })
  @ApiUnprocessableEntityResponse({
    description: 'Validation error',
    type: ValidationErrorResponse,
  })
  async handler(
    @Param('id') id: string,
    @Body() body: UpdateFlashcardPatchPayload,
    @CurrentUser() user: UserContext,
  ): Promise<void> {
    await this.updater.execute({
      id,
      requesterId: user.userId!,
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
