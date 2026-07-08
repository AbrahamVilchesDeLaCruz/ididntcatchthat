import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  type AudioGenerator,
  type AudioAccent,
  type AudioGenerationMode,
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

  async generate(
    text: string,
    accent: AudioAccent,
    mode: AudioGenerationMode,
  ): Promise<Buffer> {
    const voiceId = this.config.getOrThrow<string>(VOICE_ID_ENV[accent]);
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    const isExpression = mode === 'expression';

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
        ...(isExpression ? { apply_text_normalization: 'off' } : {}),
        voice_settings: isExpression
          ? { stability: 0.85, similarity_boost: 0.9 }
          : { stability: 0.5, similarity_boost: 0.75 },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      let detail: string | null = null;
      try {
        const parsed = JSON.parse(body) as {
          detail?: { message?: string } | string;
        };
        if (typeof parsed.detail === 'string') {
          detail = parsed.detail;
        } else if (parsed.detail?.message) {
          detail = parsed.detail.message;
        }
      } catch {
        detail = body.length > 0 ? body.slice(0, 200) : null;
      }
      throw new AudioGenerationFailed(
        response.status,
        response.statusText,
        detail,
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}
