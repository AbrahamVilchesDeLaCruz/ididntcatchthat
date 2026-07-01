import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class SearchGamesGetQuery {
  @ApiProperty({
    enum: ['paused'],
    example: 'paused',
    description:
      'Filter games by status. Currently only paused sessions are supported.',
  })
  @IsIn(['paused'])
  status!: 'paused';
}
