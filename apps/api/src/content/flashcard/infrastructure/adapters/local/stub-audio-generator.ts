import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Injectable } from '@nestjs/common';
import {
  type AudioGenerator,
  type AudioAccent,
  type AudioGenerationMode,
} from '@/content/flashcard/domain/audio-generator';

let cachedSampleAudio: Buffer | null = null;

function loadSampleAudio(): Buffer {
  if (cachedSampleAudio) {
    return cachedSampleAudio;
  }

  const samplePath = join(process.cwd(), 'assets/local/sample.mp3');
  cachedSampleAudio = readFileSync(samplePath);
  return cachedSampleAudio;
}

@Injectable()
export class StubAudioGenerator implements AudioGenerator {
  generate(
    _text: string,
    _accent: AudioAccent,
    _mode: AudioGenerationMode,
  ): Promise<Buffer> {
    return Promise.resolve(loadSampleAudio());
  }
}
