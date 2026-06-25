import { Injectable } from '@nestjs/common';
import { type AiPhoneticsGenerator } from '@/content/flashcard/domain/ai-phonetics-generator';

@Injectable()
export class StubAiPhoneticsGenerator implements AiPhoneticsGenerator {
  generate(
    _expression: string,
  ): Promise<{ ipaNotation: string; nativeSpeech: string }> {
    return Promise.resolve({
      ipaNotation: '/test/',
      nativeSpeech: 'test',
    });
  }
}
