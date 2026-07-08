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
import { FlashcardAccessDenied } from './exceptions/flashcard-access-denied';
import { FlashcardCreatedEvent } from './events/flashcard-created.event';
import { FlashcardExpressionUpdatedEvent } from './events/flashcard-expression-updated.event';
import { FlashcardMeaningUpdatedEvent } from './events/flashcard-meaning-updated.event';
import { FlashcardAudioGeneratingEvent } from './events/flashcard-audio-generating.event';
import { FlashcardAudioRegenerationRequestedEvent } from './events/flashcard-audio-regeneration-requested.event';
import { FlashcardAudioReadyEvent } from './events/flashcard-audio-ready.event';
import { FlashcardAudioFailedEvent } from './events/flashcard-audio-failed.event';
import { FlashcardExamplesCompletedEvent } from './events/flashcard-examples-completed.event';
import { FlashcardExamplesUpdatedEvent } from './events/flashcard-examples-updated.event';
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
  deletedAt: string | null;
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
  public constructor(
    public readonly id: FlashcardId,
    private _expression: Expression,
    private _meaning: Meaning,
    private _category: Category,
    private _subcategory: Subcategory,
    private _ipaNotation: IpaNotation | null,
    private _nativeSpeech: NativeSpeech | null,
    private _audioStatus: AudioStatus,
    private _audioUrls: AudioUrls | null,
    private _examples: Example[],
    public readonly createdBy: string,
    private _deletedAt: Date | null = null,
  ) {
    super();
  }

  get expression(): Expression {
    return this._expression;
  }
  get meaning(): Meaning {
    return this._meaning;
  }
  get category(): Category {
    return this._category;
  }
  get subcategory(): Subcategory {
    return this._subcategory;
  }
  get ipaNotation(): IpaNotation | null {
    return this._ipaNotation;
  }
  get nativeSpeech(): NativeSpeech | null {
    return this._nativeSpeech;
  }
  get audioStatus(): AudioStatus {
    return this._audioStatus;
  }
  get audioUrls(): AudioUrls | null {
    return this._audioUrls;
  }
  static readonly MAX_EXAMPLES = 3;

  get examples(): Example[] {
    return [...this._examples];
  }

  get missingExampleCount(): number {
    return Math.max(0, Flashcard.MAX_EXAMPLES - this._examples.length);
  }

  get nextExamplePosition(): 1 | 2 | 3 {
    return (this._examples.length + 1) as 1 | 2 | 3;
  }

  get examplesEnglishText(): string {
    return this._examples.map((e) => e.textEn).join('. ');
  }

  get deletedAt(): Date | null {
    return this._deletedAt;
  }

  softDelete(): void {
    this._deletedAt = new Date();
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

  assertCanBeModifiedBy(requesterId: string, requesterRole: string): void {
    if (requesterRole === 'admin') return;
    if (this.createdBy !== requesterId) throw new FlashcardAccessDenied();
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
    if (value === this._expression.value) return;
    this._expression = new Expression(value);
    this.record(
      new FlashcardExpressionUpdatedEvent(this.id.value, {
        flashcardId: this.id.value,
        expression: this._expression.value,
      }),
    );
  }

  private applyMeaning(value: string): void {
    if (value === this._meaning.value) return;
    this._meaning = new Meaning(value);
    this.record(
      new FlashcardMeaningUpdatedEvent(this.id.value, {
        flashcardId: this.id.value,
        meaning: this._meaning.value,
      }),
    );
  }

  private applyCategory(
    categoryValue: string | undefined,
    subcategoryValue: string | undefined,
  ): void {
    if (categoryValue !== undefined && categoryValue !== this._category.value) {
      this._category = new Category(categoryValue);
      if (subcategoryValue === undefined) {
        this._subcategory = new Subcategory(
          this._subcategory.value,
          this._category,
        );
      }
    }
    if (
      subcategoryValue !== undefined &&
      subcategoryValue !== this._subcategory.value
    ) {
      this._subcategory = new Subcategory(subcategoryValue, this._category);
    }
  }

  private applyIpaNotation(value: string | null): void {
    this._ipaNotation = value !== null ? new IpaNotation(value) : null;
  }

  private applyNativeSpeech(value: string | null): void {
    this._nativeSpeech = value !== null ? new NativeSpeech(value) : null;
  }

  private setExamples(examples: ExampleInput[]): void {
    this._examples = Flashcard.buildExamples(this.id.value, examples);
  }

  private applyExamples(examples: ExampleInput[]): void {
    const previous = JSON.stringify(
      this._examples.map((example) => example.toPrimitives()),
    );
    this.setExamples(examples);
    const next = JSON.stringify(
      this._examples.map((example) => example.toPrimitives()),
    );
    if (previous === next) return;

    this.record(
      new FlashcardExamplesUpdatedEvent(this.id.value, {
        flashcardId: this.id.value,
        examples: this._examples.map((example) => example.toPrimitives()),
      }),
    );
  }

  markAudioGenerating(): void {
    this._audioStatus = new AudioStatus(AudioStatusValue.Generating);
    this.record(
      new FlashcardAudioGeneratingEvent(this.id.value, {
        flashcardId: this.id.value,
      }),
    );
  }

  markAudioRegenerationRequested(): void {
    this._audioStatus = new AudioStatus(AudioStatusValue.Generating);
    this.record(
      new FlashcardAudioRegenerationRequestedEvent(this.id.value, {
        flashcardId: this.id.value,
      }),
    );
  }

  markAudioReady(audioUrls: AudioUrls): void {
    this._audioStatus = new AudioStatus(AudioStatusValue.Ready);
    this._audioUrls = audioUrls;
    this.record(
      new FlashcardAudioReadyEvent(this.id.value, {
        flashcardId: this.id.value,
        audioUrls: audioUrls.toPrimitives(),
      }),
    );
  }

  markAudioFailed(): void {
    this._audioStatus = new AudioStatus(AudioStatusValue.Failed);
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
    this.setExamples([...existing, ...newExamples]);
    this.record(
      new FlashcardExamplesCompletedEvent(this.id.value, {
        flashcardId: this.id.value,
        examples: this.examples.map((e) => e.toPrimitives()),
      }),
    );
  }

  completePhonetics(ipaNotation: string, nativeSpeech: string): void {
    this._ipaNotation = new IpaNotation(ipaNotation);
    this._nativeSpeech = new NativeSpeech(nativeSpeech);
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
    if (primitives.length > Flashcard.MAX_EXAMPLES) {
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
      p.deletedAt !== null ? new Date(p.deletedAt) : null,
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
      deletedAt: this._deletedAt?.toISOString() ?? null,
    };
  }
}
