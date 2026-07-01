import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { PageViewRecorder } from '@/analytics/page-view/application/page-view-recorder';
import { ValidationErrorResponse } from '@/shared/infrastructure/http/response/validation-error.response';
import { RecordPageViewPostPayload } from './record-page-view-post.payload';

@ApiTags('analytics')
@Controller('analytics')
export class RecordPageViewPostController {
  constructor(private readonly recorder: PageViewRecorder) {}

  @Post('page-views')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Record a page view',
    description:
      'Public endpoint called by the SPA on each route change. Persists path, visitor id, optional user id and referrer. ' +
      'No authentication required.',
  })
  @ApiUnprocessableEntityResponse({
    description: 'Invalid path or visitor id',
    type: ValidationErrorResponse,
  })
  async handler(@Body() body: RecordPageViewPostPayload): Promise<void> {
    await this.recorder.execute({
      path: body.path,
      visitorId: body.visitorId,
      userId: body.userId ?? null,
      referrer: body.referrer ?? null,
    });
  }
}
