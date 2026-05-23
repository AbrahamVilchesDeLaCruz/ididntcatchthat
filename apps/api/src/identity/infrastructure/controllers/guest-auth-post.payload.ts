import { IsOptional, IsString } from 'class-validator';

export class GuestAuthPostPayload {
  @IsOptional()
  @IsString()
  guestDeviceId?: string;
}

// fingerprint + ip are extracted from request in the controller
export type GuestAuthRequestMeta = {
  fingerprint: string;
  ip: string;
};
