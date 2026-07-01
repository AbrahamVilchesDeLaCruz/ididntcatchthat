import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

import { GameModeValue } from '@/gaming/domain/game-mode';
import { GameModuleValue } from '@/gaming/domain/game-module';
import { GameSourceValue } from '@/gaming/domain/game-source';

export class StartGamePostPayload {
  @ApiProperty({
    enum: GameModeValue,
    example: GameModeValue.Game,
    description: 'Game mode — study or game',
  })
  @IsEnum(GameModeValue)
  mode: GameModeValue;

  @ApiPropertyOptional({
    enum: GameModuleValue,
    example: GameModuleValue.NativeSounds,
    description: 'Content module filter. Required for catalog source.',
  })
  @IsOptional()
  @IsEnum(GameModuleValue)
  module?: GameModuleValue;

  @ApiPropertyOptional({
    example: 'th-sounds',
    maxLength: 100,
    nullable: true,
    description: 'Optional subcategory within the module',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  subcategory?: string | null;

  @ApiPropertyOptional({
    enum: GameSourceValue,
    example: GameSourceValue.Catalog,
    description: 'Card selection strategy — catalog or weakest flashcards',
  })
  @IsOptional()
  @IsEnum(GameSourceValue)
  source?: GameSourceValue;

  @ApiProperty({
    enum: [10, 20, 50],
    example: 10,
    description: 'Number of flashcards in the session',
  })
  @IsIn([10, 20, 50])
  cardCount: number;
}
