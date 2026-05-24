import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class LoginAuthPostPayload {
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  password!: string;

  @IsOptional()
  @IsString()
  guestDeviceId?: string;
}
