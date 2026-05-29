import { mock } from 'jest-mock-extended';
import { type AiExampleGenerator } from '@/content/flashcard/domain/ai-example-generator';
import { AiExampleSuggester } from '@/content/flashcard/application/suggest-examples/ai-example-suggester';
import { StringMother } from '@test/shared/domain/string-mother';
import { RequestAiExampleSuggesterMother } from './request-ai-example-suggester-mother';

describe('content/flashcard/application/suggest-examples AiExampleSuggester', () => {
  const generator = mock<AiExampleGenerator>();
  let suggester: AiExampleSuggester;

  beforeEach(() => {
    generator.generate.mockReset();
    suggester = new AiExampleSuggester(generator);
  });

  it('should return examples from the ai generator', async () => {
    const examples = [
      { textEn: StringMother.sentence(), textEs: StringMother.sentence() },
      { textEn: StringMother.sentence(), textEs: StringMother.sentence() },
    ];
    generator.generate.mockResolvedValue(examples);
    const request = RequestAiExampleSuggesterMother.random();

    const result = await suggester.execute(request);

    expect(generator.generate).toHaveBeenCalledWith(
      request.expression,
      request.category,
    );
    expect(result).toEqual({ examples });
  });
});
