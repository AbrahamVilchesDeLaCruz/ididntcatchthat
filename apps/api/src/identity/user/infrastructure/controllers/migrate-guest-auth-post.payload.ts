import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

class GuestGameAttemptPayload {
  @IsUUID()
  attemptId!: string;

  @IsString()
  answer!: string;

  @IsBoolean()
  isCorrect!: boolean;

  @IsDateString()
  answeredAt!: string;
}

class GuestGamePayload {
  @IsUUID()
  gameId!: string;

  @IsUUID()
  phraseId!: string;

  @IsDateString()
  completedAt!: string;

  @IsNumber()
  score!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestGameAttemptPayload)
  attempts!: GuestGameAttemptPayload[];
}

export class MigrateGuestAuthPostPayload {
  @IsString()
  guestDeviceId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestGamePayload)
  guestGames!: GuestGamePayload[];
}
