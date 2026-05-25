import { AudioUrlsInvalid } from './exceptions/audio-urls-invalid';

export type AudioUrlsPrimitives = {
  expression: { us: string; uk: string; au: string };
  examples: { us: string };
};

export class AudioUrls {
  readonly expression: { us: string; uk: string; au: string };
  readonly examples: { us: string };

  constructor(primitives: AudioUrlsPrimitives) {
    this.validate(primitives);
    this.expression = primitives.expression;
    this.examples = primitives.examples;
  }

  private validate(p: AudioUrlsPrimitives): void {
    if (!p.expression?.us?.trim()) throw new AudioUrlsInvalid();
    if (!p.expression?.uk?.trim()) throw new AudioUrlsInvalid();
    if (!p.expression?.au?.trim()) throw new AudioUrlsInvalid();
    if (!p.examples?.us?.trim()) throw new AudioUrlsInvalid();
  }

  toPrimitives(): AudioUrlsPrimitives {
    return {
      expression: { ...this.expression },
      examples: { ...this.examples },
    };
  }

  static fromPrimitives(p: AudioUrlsPrimitives): AudioUrls {
    return new AudioUrls(p);
  }
}
