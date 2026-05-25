export type ExampleDraft = { textEn: string; textEs: string };

export interface AiExampleGenerator {
  generate(expression: string, category: string): Promise<ExampleDraft[]>;
}

export const AI_EXAMPLE_GENERATOR = Symbol('AiExampleGenerator');
