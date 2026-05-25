import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  type PdfFlashcardExtractor,
  type FlashcardDraft,
} from '@/content/flashcard/domain/pdf-flashcard-extractor';

@Injectable()
export class DeepSeekPdfFlashcardExtractor implements PdfFlashcardExtractor {
  private readonly client: OpenAI;

  constructor(private readonly config: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.config.getOrThrow<string>('DEEPSEEK_API_KEY'),
      baseURL: 'https://api.deepseek.com',
    });
  }

  async extract(pdfBuffer: Buffer): Promise<FlashcardDraft[]> {
    const base64 = pdfBuffer.toString('base64');

    const completion = await this.client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `You are an English language expert. Extract English expressions from the provided PDF content (given as base64) and return flashcard data.
Return ONLY a JSON array with this exact structure, no markdown, no explanation:
[{
  "expression": "the expression",
  "meaning": "short Spanish meaning",
  "category": "one of: phrasal_verbs, idioms, collocations, slang, connected_speech, grammar_patterns",
  "subcategory": "relevant subcategory",
  "ipaNotation": "/ɪpə nəʊˈteɪʃən/ or null",
  "nativeSpeech": "how it sounds in connected speech or null",
  "examples": [
    {"textEn": "example sentence", "textEs": "traducción"},
    {"textEn": "second example", "textEs": "segunda traducción"}
  ]
}]`,
        },
        {
          role: 'user',
          content: `PDF content (base64): ${base64}`,
        },
      ],
      temperature: 0.3,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? '[]';
    return JSON.parse(raw) as FlashcardDraft[];
  }
}
