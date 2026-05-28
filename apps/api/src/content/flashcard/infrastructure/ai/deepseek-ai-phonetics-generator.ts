import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  type AiPhoneticsGenerator,
  type PhoneticsDraft,
} from '@/content/flashcard/domain/ai-phonetics-generator';

@Injectable()
export class DeepSeekAiPhoneticsGenerator implements AiPhoneticsGenerator {
  private readonly client: OpenAI;

  constructor(private readonly config: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.config.getOrThrow<string>('DEEPSEEK_API_KEY'),
      baseURL: 'https://api.deepseek.com',
    });
  }

  async generate(expression: string): Promise<PhoneticsDraft> {
    const completion = await this.client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `You are an English phonetics expert. Given an English expression, return its IPA notation and a short native-sounding description of how it's used in natural speech.
Return ONLY a JSON object with this exact structure, no markdown, no explanation:
{"ipaNotation": "/ˌɛksəmˈpəl/", "nativeSpeech": "short description of usage in natural speech"}`,
        },
        {
          role: 'user',
          content: `Expression: "${expression}"`,
        },
      ],
      temperature: 0.3,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? '{}';
    return JSON.parse(raw) as PhoneticsDraft;
  }
}
