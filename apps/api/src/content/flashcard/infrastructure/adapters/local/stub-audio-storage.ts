import { Injectable } from '@nestjs/common';
import { type AudioStorage } from '@/content/flashcard/domain/audio-storage';

@Injectable()
export class StubAudioStorage implements AudioStorage {
  upload(key: string, _buffer: Buffer, _contentType: string): Promise<string> {
    return Promise.resolve(`https://example.com/${key}`);
  }
}
