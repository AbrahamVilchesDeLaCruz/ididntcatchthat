import { IsUUID } from 'class-validator';

export class RecordViewPostPayload {
  @IsUUID()
  flashcardId: string;
}
