import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SuggestExamplesPostPayload {
  @ApiProperty({
    description: 'The English expression to generate examples for',
    example: 'catch up',
  })
  @IsString()
  @IsNotEmpty()
  expression: string;

  @ApiProperty({
    description: 'The category of the expression',
    example: 'phrasal_verbs',
  })
  @IsString()
  @IsNotEmpty()
  category: string;
}
