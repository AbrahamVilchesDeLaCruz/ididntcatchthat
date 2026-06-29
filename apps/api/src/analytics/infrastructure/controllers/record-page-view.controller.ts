import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
} from 'class-validator';
import { RecordPageViewUseCase } from '@/analytics/application/record-page-view/record-page-view.use-case';

class RecordPageViewPayload {
  @IsString()
  @MaxLength(500)
  path: string;

  @IsString()
  @Length(1, 100)
  visitorId: string;

  @IsOptional()
  @IsUUID()
  userId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  referrer?: string | null;
}

@ApiTags('analytics')
@Controller('analytics')
export class RecordPageViewController {
  constructor(private readonly useCase: RecordPageViewUseCase) {}

  @Post('pageview')
  @HttpCode(HttpStatus.NO_CONTENT)
  async handler(@Body() body: RecordPageViewPayload): Promise<void> {
    await this.useCase.execute({
      path: body.path,
      visitorId: body.visitorId,
      userId: body.userId ?? null,
      referrer: body.referrer ?? null,
    });
  }
}
