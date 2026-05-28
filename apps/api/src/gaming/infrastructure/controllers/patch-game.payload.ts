import { IsEnum, IsOptional, IsUUID } from 'class-validator';

const PATCH_STATUSES = ['paused', 'abandoned'] as const;

export class PatchGamePayload {
  @IsEnum(PATCH_STATUSES)
  status: 'paused' | 'abandoned';

  @IsOptional()
  @IsUUID()
  lastFlashcardId?: string;
}
