import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { RolesGuard } from '@/shared/infrastructure/auth/roles.guard';
import { Roles } from '@/shared/infrastructure/auth/roles.decorator';
import {
  AiExampleSuggester,
  type AiExampleSuggesterResponse,
} from '@/content/flashcard/application/suggest-examples/ai-example-suggester';
import { SuggestExamplesPostPayload } from './suggest-examples-post.payload';

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SuggestExamplesPostController {
  constructor(private readonly suggester: AiExampleSuggester) {}

  @Post('suggest-examples')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Suggest example sentences for a flashcard expression using AI',
  })
  @ApiResponse({ status: 200, description: 'Examples generated successfully' })
  @ApiResponse({ status: 422, description: 'Validation error' })
  async handler(
    @Body() body: SuggestExamplesPostPayload,
  ): Promise<AiExampleSuggesterResponse> {
    return this.suggester.execute({
      expression: body.expression,
      category: body.category,
    });
  }
}
