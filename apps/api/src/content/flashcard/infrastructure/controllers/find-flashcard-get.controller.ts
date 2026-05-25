import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { RolesGuard } from '@/shared/infrastructure/auth/roles.guard';
import { Roles } from '@/shared/infrastructure/auth/roles.decorator';
import { FlashcardFinder } from '@/content/flashcard/application/find/flashcard-finder';
import { type FlashcardPrimitives } from '@/content/flashcard/domain/flashcard';

@ApiTags('flashcards')
@Controller('flashcards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FindFlashcardGetController {
  constructor(private readonly finder: FlashcardFinder) {}

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Find a flashcard by id' })
  @ApiResponse({ status: 200, description: 'Flashcard found' })
  @ApiResponse({ status: 404, description: 'Flashcard not found' })
  async handler(@Param('id') id: string): Promise<FlashcardPrimitives> {
    return this.finder.execute(id);
  }
}
