export interface AudioStorage {
  upload(key: string, buffer: Buffer, contentType: string): Promise<string>;
}

export const AUDIO_STORAGE = Symbol('AudioStorage');
