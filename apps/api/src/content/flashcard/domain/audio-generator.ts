export type AudioAccent = 'us' | 'uk' | 'au';

export interface AudioGenerator {
  generate(text: string, accent: AudioAccent): Promise<Buffer>;
}

export const AUDIO_GENERATOR = Symbol('AudioGenerator');
