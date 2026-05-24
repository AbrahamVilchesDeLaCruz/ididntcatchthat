import { IsOptional, IsString } from 'class-validator';

export class GuestAuthPostPayload {
  @IsOptional()
  @IsString()
  guestDeviceId?: string;
}
