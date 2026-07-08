import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { RolesGuard } from '@/shared/infrastructure/auth/roles.guard';
import { Roles } from '@/shared/infrastructure/auth/roles.decorator';
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import { FlashcardRemover } from '@/content/flashcard/application/remove/flashcard-remover';

@ApiTags('content')
@ApiBearerAuth('access-token')
@Controller('flashcards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeleteFlashcardDeleteController {
  constructor(private readonly remover: FlashcardRemover) {}

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Soft delete a flashcard',
    description:
      'Marks a flashcard as deleted. It is hidden from backoffice and new games but preserved for existing games and stats. Requires admin JWT.',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Admin role required or access denied' })
  @ApiNotFoundResponse({ description: 'Flashcard not found' })
  async handler(
    @Param('id') id: string,
    @CurrentUser() user: UserContext,
  ): Promise<void> {
    await this.remover.execute({
      id,
      requesterId: user.userId!,
      requesterRole: user.type,
    });
  }
}
