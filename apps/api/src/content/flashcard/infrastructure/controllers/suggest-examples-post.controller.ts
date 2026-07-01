import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
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
import { ValidationErrorSwagger } from '@/shared/infrastructure/http/response/validation-error.swagger';
import {
  AiExampleSuggester,
  type ResponseAiExampleSuggester,
} from '@/content/flashcard/application/suggest-examples/ai-example-suggester';
import { SuggestExamplesPostPayload } from './suggest-examples-post.payload';

const SUGGEST_EXAMPLES_BODY_EXAMPLE: SuggestExamplesPostPayload = {
  expression: 'catch up',
  category: 'phrasal_verbs',
};

@ApiTags('ai')
@ApiBearerAuth('access-token')
@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SuggestExamplesPostController {
  constructor(private readonly suggester: AiExampleSuggester) {}

  @Post('suggest-examples')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Suggest example sentences for a flashcard expression using AI',
    description:
      'Generates bilingual example sentences for backoffice flashcard editing. Requires admin JWT.',
  })
  @ApiBody({
    type: SuggestExamplesPostPayload,
    examples: {
      default: {
        summary: 'Phrasal verb examples',
        value: SUGGEST_EXAMPLES_BODY_EXAMPLE,
      },
    },
  })
  @ApiOkResponse({
    description: 'Examples generated successfully',
    schema: {
      type: 'object',
      properties: {
        examples: { type: 'array', items: { type: 'object' } },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  @ApiUnprocessableEntityResponse({
    description: 'Validation error',
    type: ValidationErrorSwagger,
  })
  async handler(
    @Body() body: SuggestExamplesPostPayload,
  ): Promise<ResponseAiExampleSuggester> {
    return this.suggester.execute({
      expression: body.expression,
      category: body.category,
    });
  }
}
