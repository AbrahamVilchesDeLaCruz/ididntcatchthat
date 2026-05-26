import { IsEnum, IsIn, IsOptional } from 'class-validator';

const GAME_MODES = ['study', 'game'] as const;
const GAME_MODULES = [
  'native_sounds',
  'connecting_words',
  'beautifying_sentences',
  'sounding_native',
  'random',
] as const;

export class StartGamePostPayload {
  @IsEnum(GAME_MODES)
  mode: string;

  @IsOptional()
  @IsEnum(GAME_MODULES)
  module?: string;

  @IsIn([10, 20, 50])
  cardCount: number;
}
