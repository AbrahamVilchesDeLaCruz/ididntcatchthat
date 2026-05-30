import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { ConfigService } from '@nestjs/config';

import { JwtStrategy } from '@/shared/infrastructure/auth/jwt.strategy';
import { GuestStrategy } from '@/shared/infrastructure/auth/guest.strategy';
import { GoogleStrategy } from '@/shared/infrastructure/auth/google.strategy';

import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { GuestAuthGuard } from '@/shared/infrastructure/auth/guest.guard';
import { GoogleAuthGuard } from '@/shared/infrastructure/auth/google.guard';
import { AnyAuthGuard } from '@/shared/infrastructure/auth/any-auth.guard';
import { RolesGuard } from '@/shared/infrastructure/auth/roles.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') ??
            '15m') as StringValue,
        },
      }),
    }),
  ],
  providers: [
    JwtStrategy,
    GuestStrategy,
    GoogleStrategy,
    JwtAuthGuard,
    GuestAuthGuard,
    GoogleAuthGuard,
    AnyAuthGuard,
    RolesGuard,
  ],
  exports: [
    JwtModule,
    JwtStrategy,
    GuestStrategy,
    GoogleStrategy,
    JwtAuthGuard,
    GuestAuthGuard,
    GoogleAuthGuard,
    AnyAuthGuard,
    RolesGuard,
  ],
})
export class AuthModule {}
