import { AggregateRoot } from '@/shared/domain/aggregate-root';
import { FlashcardId } from './flashcard-id';
import { Expression } from './expression';
import { Meaning } from './meaning';
import { Category } from './category';
import { Subcategory } from './subcategory';
import { IpaNotation } from './ipa-notation';
import { NativeSpeech } from './native-speech';
import { AudioStatus } from './audio-status';
import { AudioUrls, type AudioUrlsPrimitives } from './audio-urls';
import { Example, type ExamplePrimitives } from './example';
import { InvalidExampleCount } from './exceptions/invalid-example-count';
import { FlashcardCreatedEvent } from './events/flashcard-created.event';
import { FlashcardExpressionUpdatedEvent } from './events/flashcard-expression-updated.event';
import { FlashcardMeaningUpdatedEvent } from './events/flashcard-meaning-updated.event';
import { FlashcardAudioGeneratingEvent } from './events/flashcard-audio-generating.event';
import { FlashcardAudioReadyEvent } from './events/flashcard-audio-ready.event';
import { FlashcardAudioFailedEvent } from './events/flashcard-audio-failed.event';

export type FlashcardPrimitives = {
  id: string;
  expression: string;
  meaning: string;
  category: string;
  subcategory: string;
  ipaNotation: string | null;
  nativeSpeech: string | null;
  audioStatus: string;
  audioUrls: AudioUrlsPrimitives | null;
  examples: ExamplePrimitives[];
  createdBy: string;
};

export type FlashcardUpdateFields = {
  expression?: string;
  meaning?: string;
  category?: string;
  subcategory?: string;
  ipaNotation?: string | null;
  nativeSpeech?: string | null;
  examples?: ExamplePrimitives[];
};

export class Flashcard extends AggregateRoot<FlashcardPrimitives> {
  private constructor(
    public readonly id: FlashcardId,
    public expression: Expression,
    public meaning: Meaning,
    public category: Category,
    public subcategory: Subcategory,
    public ipaNotation: IpaNotation | null,
    public nativeSpeech: NativeSpeech | null,
    public audioStatus: AudioStatus,
    public audioUrls: AudioUrls | null,
    public examples: Example[],
    public readonly createdBy: string,
  ) {
    super();
  }

  static create(
    id: string,
    expression: string,
    meaning: string,
    category: string,
    subcategory: string,
    ipaNotation: string | null,
    nativeSpeech: string | null,
    examples: ExamplePrimitives[],
    createdBy: string,
  ): Flashcard {
    const flashcard = new Flashcard(
      new FlashcardId(id),
      new Expression(expression),
      new Meaning(meaning),
      new Category(category),
      Subcategory.create(subcategory, new Category(category)),
      ipaNotation !== null ? new IpaNotation(ipaNotation) : null,
      nativeSpeech !== null ? new NativeSpeech(nativeSpeech) : null,
      AudioStatus.pending(),
      null,
      Flashcard.buildExamples(id, examples),
      createdBy,
    );

    flashcard.record(
      new FlashcardCreatedEvent(flashcard.id.value, flashcard.toPrimitives()),
    );

    return flashcard;
  }

  update(fields: FlashcardUpdateFields): void {
    if (fields.expression !== undefined)
      this.applyExpression(fields.expression);
    if (fields.meaning !== undefined) this.applyMeaning(fields.meaning);
    if (fields.category !== undefined || fields.subcategory !== undefined)
      this.applyCategory(fields.category, fields.subcategory);
    if (fields.ipaNotation !== undefined)
      this.applyIpaNotation(fields.ipaNotation);
    if (fields.nativeSpeech !== undefined)
      this.applyNativeSpeech(fields.nativeSpeech);
    if (fields.examples !== undefined) this.applyExamples(fields.examples);
  }

  private applyExpression(value: string): void {
    if (value === this.expression.value) return;
    this.expression = new Expression(value);
    this.record(
      new FlashcardExpressionUpdatedEvent(this.id.value, {
        flashcardId: this.id.value,
        expression: this.expression.value,
      }),
    );
  }

  private applyMeaning(value: string): void {
    if (value === this.meaning.value) return;
    this.meaning = new Meaning(value);
    this.record(
      new FlashcardMeaningUpdatedEvent(this.id.value, {
        flashcardId: this.id.value,
        meaning: this.meaning.value,
      }),
    );
  }

  private applyCategory(
    categoryValue: string | undefined,
    subcategoryValue: string | undefined,
  ): void {
    if (categoryValue !== undefined && categoryValue !== this.category.value) {
      this.category = new Category(categoryValue);
    }
    if (
      subcategoryValue !== undefined &&
      subcategoryValue !== this.subcategory.value
    ) {
      this.subcategory = Subcategory.create(subcategoryValue, this.category);
    }
  }

  private applyIpaNotation(value: string | null): void {
    this.ipaNotation = value !== null ? new IpaNotation(value) : null;
  }

  private applyNativeSpeech(value: string | null): void {
    this.nativeSpeech = value !== null ? new NativeSpeech(value) : null;
  }

  private applyExamples(examples: ExamplePrimitives[]): void {
    this.examples = Flashcard.buildExamples(this.id.value, examples);
  }

  markAudioGenerating(): void {
    this.audioStatus = AudioStatus.generating();
    this.record(
      new FlashcardAudioGeneratingEvent(this.id.value, {
        flashcardId: this.id.value,
      }),
    );
  }

  markAudioReady(audioUrls: AudioUrls): void {
    this.audioStatus = AudioStatus.ready();
    this.audioUrls = audioUrls;
    this.record(
      new FlashcardAudioReadyEvent(this.id.value, {
        flashcardId: this.id.value,
        audioUrls: audioUrls.toPrimitives(),
      }),
    );
  }

  markAudioFailed(): void {
    this.audioStatus = AudioStatus.failed();
    this.record(
      new FlashcardAudioFailedEvent(this.id.value, {
        flashcardId: this.id.value,
      }),
    );
  }

  private static buildExamples(
    flashcardId: string,
    primitives: ExamplePrimitives[],
  ): Example[] {
    if (primitives.length < 1 || primitives.length > 3) {
      throw new InvalidExampleCount();
    }
    return primitives.map((p) => Example.fromPrimitives({ ...p, flashcardId }));
  }

  static fromPrimitives(p: FlashcardPrimitives): Flashcard {
    const categoryVO: Category = new Category(p.category);
    return new Flashcard(
      new FlashcardId(p.id),
      new Expression(p.expression),
      new Meaning(p.meaning),
      categoryVO,
      Subcategory.create(p.subcategory, categoryVO),
      p.ipaNotation !== null ? new IpaNotation(p.ipaNotation) : null,
      p.nativeSpeech !== null ? new NativeSpeech(p.nativeSpeech) : null,
      new AudioStatus(p.audioStatus),
      p.audioUrls !== null ? AudioUrls.fromPrimitives(p.audioUrls) : null,
      p.examples.map((e) => Example.fromPrimitives(e)),
      p.createdBy,
    );
  }

  toPrimitives(): FlashcardPrimitives {
    return {
      id: this.id.value,
      expression: this.expression.value,
      meaning: this.meaning.value,
      category: this.category.value,
      subcategory: this.subcategory.value,
      ipaNotation: this.ipaNotation?.value ?? null,
      nativeSpeech: this.nativeSpeech?.value ?? null,
      audioStatus: this.audioStatus.value,
      audioUrls: this.audioUrls?.toPrimitives() ?? null,
      examples: this.examples.map((e) => e.toPrimitives()),
      createdBy: this.createdBy,
    };
  }
}
