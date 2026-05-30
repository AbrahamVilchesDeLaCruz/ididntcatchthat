import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  type AudioGenerator,
  type AudioAccent,
} from '@/content/flashcard/domain/audio-generator';
import { AudioGenerationFailed } from '@/content/flashcard/domain/exceptions/audio-generation-failed';

const VOICE_ID_ENV: Record<AudioAccent, string> = {
  us: 'ELEVENLABS_VOICE_ID_AMERICAN',
  uk: 'ELEVENLABS_VOICE_ID_BRITISH',
  au: 'ELEVENLABS_VOICE_ID_AUSTRALIAN',
};

@Injectable()
export class ElevenLabsAudioGenerator implements AudioGenerator {
  private readonly apiKey: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.getOrThrow<string>('ELEVEN_LABS_API_KEY');
  }

  async generate(text: string, accent: AudioAccent): Promise<Buffer> {
    const voiceId = this.config.getOrThrow<string>(VOICE_ID_ENV[accent]);
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });

    if (!response.ok) {
      throw new AudioGenerationFailed(response.status, response.statusText);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}
