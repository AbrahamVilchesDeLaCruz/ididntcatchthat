import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AnyAuthGuard } from '@/shared/infrastructure/auth/any-auth.guard';
import { GameFlashcardsFetcher } from '@/gaming/application/fetch-flashcards/game-flashcards-fetcher';
import { type GameFlashcardDto } from '@/gaming/domain/game-flashcard-query';

@ApiTags('games')
@Controller('games')
@UseGuards(AnyAuthGuard)
export class GetGameFlashcardsController {
  constructor(private readonly fetcher: GameFlashcardsFetcher) {}

  @Get(':gameId/flashcards')
  @ApiOperation({ summary: 'Get all flashcards for a game session' })
  @ApiResponse({
    status: 200,
    description: 'List of flashcards ordered by position',
  })
  @ApiResponse({ status: 404, description: 'Game not found' })
  async handler(@Param('gameId') gameId: string): Promise<GameFlashcardDto[]> {
    return this.fetcher.execute({ gameId });
  }
}
