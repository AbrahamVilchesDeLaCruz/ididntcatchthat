import { IsBoolean, IsUUID } from 'class-validator';

export class RecordAttemptPostPayload {
  @IsUUID()
  flashcardId: string;

  @IsBoolean()
  correct: boolean;
}
