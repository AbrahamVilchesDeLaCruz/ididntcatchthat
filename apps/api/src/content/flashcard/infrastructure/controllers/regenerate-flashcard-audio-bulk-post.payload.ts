import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

const BULK_REGENERATABLE_AUDIO_STATUSES = ['pending', 'failed'] as const;

export class RegenerateFlashcardAudioBulkPostPayload {
  @IsIn(BULK_REGENERATABLE_AUDIO_STATUSES)
  audioStatus!: (typeof BULK_REGENERATABLE_AUDIO_STATUSES)[number];

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  subcategory?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  page!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize!: number;
}
