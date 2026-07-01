import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { PageViewRecorder } from '@/analytics/page-view/application/page-view-recorder';
import { ValidationErrorSwagger } from '@/shared/infrastructure/http/response/validation-error.swagger';
import { RecordPageViewPostPayload } from './record-page-view-post.payload';

const PAGE_VIEW_BODY_EXAMPLE: RecordPageViewPostPayload = {
  path: '/games',
  visitorId: '550e8400-e29b-41d4-a716-446655440000',
  userId: null,
  referrer: 'https://google.com',
};

@ApiTags('analytics')
@Controller('analytics')
export class RecordPageViewPostController {
  constructor(private readonly recorder: PageViewRecorder) {}

  @Post('pageview')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Record a page view',
    description:
      'Public endpoint called by the SPA on each route change. Persists path, visitor id, optional user id and referrer. ' +
      'No authentication required.',
  })
  @ApiBody({
    type: RecordPageViewPostPayload,
    description: 'Route visit payload sent by usePageView() on the client',
    examples: {
      anonymous: {
        summary: 'Anonymous visitor',
        value: PAGE_VIEW_BODY_EXAMPLE,
      },
      authenticated: {
        summary: 'Logged-in user',
        value: {
          ...PAGE_VIEW_BODY_EXAMPLE,
          userId: 'a1b2c3d4-e5f6-4890-abcd-ef1234567890',
        },
      },
    },
  })
  @ApiNoContentResponse({ description: 'Page view recorded' })
  @ApiUnprocessableEntityResponse({
    description: 'Invalid path or visitor id',
    type: ValidationErrorSwagger,
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
