import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
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
import { ValidationErrorResponse } from '@/shared/infrastructure/http/response/validation-error.response';
import { FlashcardAudioRegenerator } from '@/content/flashcard/application/regenerate-audio/flashcard-audio-regenerator';

@ApiTags('content')
@ApiBearerAuth('access-token')
@Controller('flashcards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RegenerateFlashcardAudioPostController {
  constructor(private readonly regenerator: FlashcardAudioRegenerator) {}

  @Post(':id/regenerate-audio')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Retry failed flashcard audio generation',
    description:
      'Regenerates audio for a flashcard whose audioStatus is failed. Requires admin JWT.',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  @ApiNotFoundResponse({ description: 'Flashcard not found' })
  @ApiUnprocessableEntityResponse({
    description: 'Flashcard audio status is not failed',
    type: ValidationErrorResponse,
  })
  async handler(@Param('id') id: string): Promise<void> {
    await this.regenerator.execute({ flashcardId: id });
  }
}
