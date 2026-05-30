import { type ExampleDraft } from '@/content/flashcard/domain/ai-example-generator';

export type RequestAiExampleSuggester = {
  expression: string;
  category: string;
};

export type ResponseAiExampleSuggester = {
  examples: ExampleDraft[];
};
