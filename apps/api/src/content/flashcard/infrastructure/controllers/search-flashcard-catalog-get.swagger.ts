import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseMetaSwagger } from '@/shared/infrastructure/http/response/api-response-meta.swagger';

export class FlashcardCatalogLabelSwagger {
  @ApiProperty({ example: 'Sonidos nativos' })
  es: string;

  @ApiProperty({ example: 'Native sounds' })
  en: string;
}

export class FlashcardCatalogSubcategorySwagger {
  @ApiProperty({ example: 'vowel_sounds' })
  value: string;

  @ApiProperty({ type: FlashcardCatalogLabelSwagger })
  label: FlashcardCatalogLabelSwagger;

  @ApiProperty({ type: FlashcardCatalogLabelSwagger })
  description: FlashcardCatalogLabelSwagger;

  @ApiProperty({
    type: [String],
    example: ['ship / sheep', 'full / fool'],
  })
  anchorExamples: string[];
}

export class FlashcardCatalogCategorySwagger {
  @ApiProperty({ example: 'native_sounds' })
  value: string;

  @ApiProperty({ type: FlashcardCatalogLabelSwagger })
  label: FlashcardCatalogLabelSwagger;

  @ApiProperty({ type: [FlashcardCatalogSubcategorySwagger] })
  subcategories: FlashcardCatalogSubcategorySwagger[];
}

export class SearchFlashcardCatalogDataSwagger {
  @ApiProperty({ type: [FlashcardCatalogCategorySwagger] })
  categories: FlashcardCatalogCategorySwagger[];
}

export class SearchFlashcardCatalogEnvelopeSwagger {
  @ApiProperty({ type: SearchFlashcardCatalogDataSwagger })
  data: SearchFlashcardCatalogDataSwagger;

  @ApiProperty({ type: ApiResponseMetaSwagger })
  meta: ApiResponseMetaSwagger;
}
