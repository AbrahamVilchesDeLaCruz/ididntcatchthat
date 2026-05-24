import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserContext } from '@/shared/domain/user-context';

@Injectable()
export class GuestStrategy extends PassportStrategy(Strategy, 'guest') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET')!,
    });
  }

  validate(payload: UserContext): UserContext {
    return payload; // type: 'guest' — sin userId
  }
}
