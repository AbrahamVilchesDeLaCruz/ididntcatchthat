import { AggregateRoot } from '@/shared/domain/aggregate-root';
import { FlashcardId } from '@/shared/domain/flashcard-id';
import { Expression } from './expression';
import { Meaning } from './meaning';
import { Category } from './category';
import { Subcategory } from './subcategory';
import { IpaNotation } from './ipa-notation';
import { NativeSpeech } from './native-speech';
import { AudioStatus, AudioStatusValue } from './audio-status';
import { AudioUrls, type AudioUrlsPrimitives } from './audio-urls';
import { Example, type ExamplePrimitives } from './example';
import { InvalidExampleCount } from './exceptions/invalid-example-count';
import { FlashcardCreatedEvent } from './events/flashcard-created.event';
import { FlashcardExpressionUpdatedEvent } from './events/flashcard-expression-updated.event';
import { FlashcardMeaningUpdatedEvent } from './events/flashcard-meaning-updated.event';
import { FlashcardAudioGeneratingEvent } from './events/flashcard-audio-generating.event';
import { FlashcardAudioReadyEvent } from './events/flashcard-audio-ready.event';
import { FlashcardAudioFailedEvent } from './events/flashcard-audio-failed.event';
import { FlashcardExamplesCompletedEvent } from './events/flashcard-examples-completed.event';
import { FlashcardPhoneticsCompletedEvent } from './events/flashcard-phonetics-completed.event';

export type ExampleInput = Omit<ExamplePrimitives, 'flashcardId'>;

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
  examples?: ExampleInput[];
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
    examples: ExampleInput[],
    createdBy: string,
  ): Flashcard {
    const categoryVO = new Category(category);
    const flashcard = new Flashcard(
      new FlashcardId(id),
      new Expression(expression),
      new Meaning(meaning),
      categoryVO,
      new Subcategory(subcategory, categoryVO),
      ipaNotation !== null ? new IpaNotation(ipaNotation) : null,
      nativeSpeech !== null ? new NativeSpeech(nativeSpeech) : null,
      new AudioStatus(AudioStatusValue.Pending),
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
      if (subcategoryValue === undefined) {
        this.subcategory = new Subcategory(
          this.subcategory.value,
          this.category,
        );
      }
    }
    if (
      subcategoryValue !== undefined &&
      subcategoryValue !== this.subcategory.value
    ) {
      this.subcategory = new Subcategory(subcategoryValue, this.category);
    }
  }

  private applyIpaNotation(value: string | null): void {
    this.ipaNotation = value !== null ? new IpaNotation(value) : null;
  }

  private applyNativeSpeech(value: string | null): void {
    this.nativeSpeech = value !== null ? new NativeSpeech(value) : null;
  }

  private applyExamples(examples: ExampleInput[]): void {
    this.examples = Flashcard.buildExamples(this.id.value, examples);
  }

  markAudioGenerating(): void {
    this.audioStatus = new AudioStatus(AudioStatusValue.Generating);
    this.record(
      new FlashcardAudioGeneratingEvent(this.id.value, {
        flashcardId: this.id.value,
      }),
    );
  }

  markAudioReady(audioUrls: AudioUrls): void {
    this.audioStatus = new AudioStatus(AudioStatusValue.Ready);
    this.audioUrls = audioUrls;
    this.record(
      new FlashcardAudioReadyEvent(this.id.value, {
        flashcardId: this.id.value,
        audioUrls: audioUrls.toPrimitives(),
      }),
    );
  }

  markAudioFailed(): void {
    this.audioStatus = new AudioStatus(AudioStatusValue.Failed);
    this.record(
      new FlashcardAudioFailedEvent(this.id.value, {
        flashcardId: this.id.value,
      }),
    );
  }

  completeExamples(newExamples: ExampleInput[]): void {
    const existing: ExampleInput[] = this.examples.map((e) => ({
      id: e.id,
      textEn: e.textEn,
      textEs: e.textEs,
      position: e.position,
    }));
    this.applyExamples([...existing, ...newExamples]);
    this.record(
      new FlashcardExamplesCompletedEvent(this.id.value, {
        flashcardId: this.id.value,
        examples: this.examples.map((e) => e.toPrimitives()),
      }),
    );
  }

  completePhonetics(ipaNotation: string, nativeSpeech: string): void {
    this.ipaNotation = new IpaNotation(ipaNotation);
    this.nativeSpeech = new NativeSpeech(nativeSpeech);
    this.record(
      new FlashcardPhoneticsCompletedEvent(this.id.value, {
        flashcardId: this.id.value,
        ipaNotation,
        nativeSpeech,
      }),
    );
  }

  private static buildExamples(
    flashcardId: string,
    primitives: ExampleInput[],
  ): Example[] {
    if (primitives.length > 3) {
      throw new InvalidExampleCount();
    }
    return primitives.map(
      (p) => new Example(p.id, flashcardId, p.textEn, p.textEs, p.position),
    );
  }

  static fromPrimitives(p: FlashcardPrimitives): Flashcard {
    const categoryVO: Category = new Category(p.category);
    return new Flashcard(
      new FlashcardId(p.id),
      new Expression(p.expression),
      new Meaning(p.meaning),
      categoryVO,
      new Subcategory(p.subcategory, categoryVO),
      p.ipaNotation !== null ? new IpaNotation(p.ipaNotation) : null,
      p.nativeSpeech !== null ? new NativeSpeech(p.nativeSpeech) : null,
      new AudioStatus(p.audioStatus),
      p.audioUrls !== null ? new AudioUrls(p.audioUrls) : null,
      p.examples.map(
        (e) => new Example(e.id, e.flashcardId, e.textEn, e.textEs, e.position),
      ),
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
