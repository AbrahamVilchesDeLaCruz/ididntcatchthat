import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { type Request } from 'express';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import { ApiResponse } from '@/shared/infrastructure/http/response/api-response';
import { resolveRequestId } from '@/shared/infrastructure/http/resolve-request-id';
import {
  GameResumer,
  type ResponseGameResumer,
} from '@/gaming/application/resume/game-resumer';

@ApiTags('games')
@Controller('games')
@UseGuards(JwtAuthGuard)
export class ResumeGameGetController {
  constructor(private readonly resumer: GameResumer) {}

  @Get(':id/resume')
  @HttpCode(HttpStatus.OK)
  async handler(
    @Param('id') id: string,
    @CurrentUser() user: UserContext,
    @Req() req: Request,
  ): Promise<ApiResponse<ResponseGameResumer>> {
    const data = await this.resumer.execute({
      gameId: id,
      userId: user.userId!,
    });
    return ApiResponse.of(data, resolveRequestId(req));
  }
}
