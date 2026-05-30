import { IsEnum, IsIn, IsOptional } from 'class-validator';

import { GameModeValue } from '@/gaming/domain/game-mode';
import { GameModuleValue } from '@/gaming/domain/game-module';

export class StartGamePostPayload {
  @IsEnum(GameModeValue)
  mode: GameModeValue;

  @IsOptional()
  @IsEnum(GameModuleValue)
  module?: GameModuleValue;

  @IsIn([10, 20, 50])
  cardCount: number;
}
