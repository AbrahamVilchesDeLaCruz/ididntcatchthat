import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { RolesGuard } from '@/shared/infrastructure/auth/roles.guard';
import { Roles } from '@/shared/infrastructure/auth/roles.decorator';
import { ValidationErrorResponse } from '@/shared/infrastructure/http/response/validation-error.response';
import { ApiResponse } from '@/shared/infrastructure/http/response/api-response';
import { resolveRequestId } from '@/shared/infrastructure/http/resolve-request-id';
import { type Request } from 'express';
import {
  AiExampleSuggester,
  type ResponseAiExampleSuggester,
} from '@/content/flashcard/application/suggest-examples/ai-example-suggester';
import { SuggestExamplesPostPayload } from './suggest-examples-post.payload';

@ApiTags('content')
@ApiBearerAuth('access-token')
@Controller('flashcards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SuggestExamplesPostController {
  constructor(private readonly suggester: AiExampleSuggester) {}

  @Post('example-suggestions')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Suggest example sentences for a flashcard expression using AI',
    description:
      'Generates bilingual example sentences for backoffice flashcard editing. Requires admin JWT.',
  })
  @ApiOkResponse({
    description: 'Examples generated successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  @ApiUnprocessableEntityResponse({
    description: 'Validation error',
    type: ValidationErrorResponse,
  })
  async handler(
    @Req() req: Request,
    @Body() body: SuggestExamplesPostPayload,
  ): Promise<ApiResponse<ResponseAiExampleSuggester>> {
    const data = await this.suggester.execute({
      expression: body.expression,
      category: body.category,
    });
    return ApiResponse.of(data, resolveRequestId(req));
  }
}
