import { IsIn, IsOptional, IsString } from 'class-validator';

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
}
