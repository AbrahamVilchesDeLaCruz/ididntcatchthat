import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { type Request } from 'express';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import { ApiResponse } from '@/shared/infrastructure/http/response/api-response';
import { resolveRequestId } from '@/shared/infrastructure/http/resolve-request-id';
import { ValidationErrorResponse } from '@/shared/infrastructure/http/response/validation-error.response';
import { RankingProfileUpdater } from '@/identity/user/application/update-profile/ranking-profile-updater';
import { UpdateRankingProfilePatchPayload } from './update-ranking-profile-patch.payload';

@ApiTags('identity')
@ApiBearerAuth('access-token')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UpdateRankingProfilePatchController {
  constructor(private readonly updater: RankingProfileUpdater) {}

  @Patch('me/ranking-profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update the current user ranking profile' })
  @ApiOkResponse({ description: 'Updated ranking profile' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiUnprocessableEntityResponse({
    description: 'Validation error',
    type: ValidationErrorResponse,
  })
  async handler(
    @CurrentUser() user: UserContext,
    @Body() body: UpdateRankingProfilePatchPayload,
    @Req() req: Request,
  ): Promise<
    ApiResponse<Awaited<ReturnType<RankingProfileUpdater['execute']>>>
  > {
    const data = await this.updater.execute({
      userId: user.userId!,
      showInRanking: body.showInRanking,
      nickname: body.nickname,
    });
    return ApiResponse.of(data, resolveRequestId(req));
  }
}
