import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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
import { SubcategoryProgressFinder } from '@/progress/application/find/subcategory-progress-finder';
import { type SubcategoryProgressDto } from '@/progress/domain/subcategory-progress.query';

@ApiTags('progress')
@Controller('progress')
@UseGuards(JwtAuthGuard)
export class GetSubcategoriesProgressGetController {
  constructor(private readonly finder: SubcategoryProgressFinder) {}

  @Get('subcategories')
  @HttpCode(HttpStatus.OK)
  async handler(
    @CurrentUser() user: UserContext,
    @Req() req: Request,
  ): Promise<ApiResponse<SubcategoryProgressDto[]>> {
    const data = await this.finder.execute({ userId: user.userId! });
    return ApiResponse.of(data, resolveRequestId(req));
  }
}
