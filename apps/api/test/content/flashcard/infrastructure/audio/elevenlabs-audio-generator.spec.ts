import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { type ConfigService } from '@nestjs/config';
import { AudioGenerationFailed } from '@/content/flashcard/domain/exceptions/audio-generation-failed';
import { ElevenLabsAudioGenerator } from '@/content/flashcard/infrastructure/audio/elevenlabs-audio-generator';

describe('content/flashcard/infrastructure/audio ElevenLabsAudioGenerator', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should include ElevenLabs error detail when the API returns JSON', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: () =>
        Promise.resolve(
          JSON.stringify({
            detail: { message: 'Invalid API key' },
          }),
        ),
    });

    const generator = new ElevenLabsAudioGenerator({
      get: (key: string) => {
        if (key === 'ELEVENLABS_MAX_CONCURRENT') return 3;
        return undefined;
      },
      getOrThrow: (key: string) => {
        if (key === 'ELEVEN_LABS_API_KEY') return 'test-key';
        return 'voice-id';
      },
    } as ConfigService);

    await expect(
      generator.generate('hello', 'us', 'expression'),
    ).rejects.toThrow(AudioGenerationFailed);

    await expect(
      generator.generate('hello', 'us', 'expression'),
    ).rejects.toMatchObject({
      status: 401,
      detail: 'Invalid API key',
    });
  });
});
