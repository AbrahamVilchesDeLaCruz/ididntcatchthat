export type AudioAccent = 'us' | 'uk' | 'au';
export type AudioGenerationMode = 'expression' | 'examples';

export interface AudioGenerator {
  generate(
    text: string,
    accent: AudioAccent,
    mode: AudioGenerationMode,
  ): Promise<Buffer>;
}

export const AUDIO_GENERATOR = Symbol('AudioGenerator');
