import { ApiProperty } from '@nestjs/swagger';

export class ValidationErrorResponse {
  @ApiProperty({ example: 422 })
  statusCode: number;

  @ApiProperty({
    example: ['path must be shorter than or equal to 500 characters'],
    type: [String],
  })
  message: string[];

  @ApiProperty({ example: 'Unprocessable Entity' })
  error: string;
}
