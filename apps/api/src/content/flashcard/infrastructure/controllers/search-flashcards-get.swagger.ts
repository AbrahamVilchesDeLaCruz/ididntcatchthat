import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseMetaSwagger } from '@/shared/infrastructure/http/response/api-response-meta.swagger';

export class SearchFlashcardsPaginationSwagger {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 142 })
  total_items: number;

  @ApiProperty({ example: 8 })
  total_pages: number;

  @ApiProperty({ example: true })
  has_next_page: boolean;

  @ApiProperty({ example: false })
  has_prev_page: boolean;
}

export class SearchFlashcardsEnvelopeSwagger {
  @ApiProperty({
    type: 'array',
    items: { type: 'object' },
    description: 'Flashcard primitives matching the search filters',
  })
  data: unknown[];

  @ApiProperty({ type: SearchFlashcardsPaginationSwagger })
  pagination: SearchFlashcardsPaginationSwagger;

  @ApiProperty({ type: ApiResponseMetaSwagger })
  meta: ApiResponseMetaSwagger;
}
