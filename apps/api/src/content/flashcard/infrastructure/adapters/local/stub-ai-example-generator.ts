import { Injectable } from '@nestjs/common';
import { type AiExampleGenerator } from '@/content/flashcard/domain/ai-example-generator';

@Injectable()
export class StubAiExampleGenerator implements AiExampleGenerator {
  generate(
    _expression: string,
    _category: string,
  ): Promise<{ textEn: string; textEs: string }[]> {
    return Promise.resolve([
      { textEn: 'Example one', textEs: 'Ejemplo uno' },
      { textEn: 'Example two', textEs: 'Ejemplo dos' },
    ]);
  }
}
