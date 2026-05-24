import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { type UserContext } from '@/shared/domain/user-context';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserContext => {
    const request = ctx.switchToHttp().getRequest<{ user: UserContext }>();
    return request.user;
  },
);
