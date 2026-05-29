import { Inject, Injectable } from '@nestjs/common';
import {
  type AiExampleGenerator,
  AI_EXAMPLE_GENERATOR,
} from '@/content/flashcard/domain/ai-example-generator';
import {
  type RequestAiExampleSuggester,
  type ResponseAiExampleSuggester,
} from './request-ai-example-suggester';

export type {
  RequestAiExampleSuggester,
  ResponseAiExampleSuggester,
} from './request-ai-example-suggester';

@Injectable()
export class AiExampleSuggester {
  constructor(
    @Inject(AI_EXAMPLE_GENERATOR)
    private readonly generator: AiExampleGenerator,
  ) {}

  async execute(
    request: RequestAiExampleSuggester,
  ): Promise<ResponseAiExampleSuggester> {
    const { expression, category } = request;
    const examples = await this.generator.generate(expression, category);
    return { examples };
  }
}
