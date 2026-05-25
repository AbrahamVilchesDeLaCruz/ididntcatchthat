import { Inject, Injectable } from '@nestjs/common';
import {
  type AiExampleGenerator,
  AI_EXAMPLE_GENERATOR,
  type ExampleDraft,
} from '@/content/flashcard/domain/ai-example-generator';

export type AiExampleSuggesterRequest = {
  expression: string;
  category: string;
};

export type AiExampleSuggesterResponse = {
  examples: ExampleDraft[];
};

@Injectable()
export class AiExampleSuggester {
  constructor(
    @Inject(AI_EXAMPLE_GENERATOR)
    private readonly generator: AiExampleGenerator,
  ) {}

  async execute(
    request: AiExampleSuggesterRequest,
  ): Promise<AiExampleSuggesterResponse> {
    const examples = await this.generator.generate(
      request.expression,
      request.category,
    );
    return { examples };
  }
}
