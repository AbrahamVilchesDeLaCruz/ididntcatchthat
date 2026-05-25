import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  type AiExampleGenerator,
  type ExampleDraft,
} from '@/content/flashcard/domain/ai-example-generator';

@Injectable()
export class DeepSeekAiExampleGenerator implements AiExampleGenerator {
  private readonly client: OpenAI;

  constructor(private readonly config: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.config.getOrThrow<string>('DEEPSEEK_API_KEY'),
      baseURL: 'https://api.deepseek.com',
    });
  }

  async generate(
    expression: string,
    category: string,
  ): Promise<ExampleDraft[]> {
    const completion = await this.client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `You are an English language expert. Given an English expression and its category, generate exactly 2 natural example sentences that demonstrate how native speakers use this expression. 
Return ONLY a JSON array with this exact structure, no markdown, no explanation:
[{"textEn": "example in English", "textEs": "translation in Spanish"}]`,
        },
        {
          role: 'user',
          content: `Expression: "${expression}"\nCategory: ${category}`,
        },
      ],
      temperature: 0.7,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? '[]';
    return JSON.parse(raw) as ExampleDraft[];
  }
}
