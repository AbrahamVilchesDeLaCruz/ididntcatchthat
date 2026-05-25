import {
  AudioUrls,
  type AudioUrlsPrimitives,
} from '@/content/flashcard/domain/audio-urls';

export class AudioUrlsMother {
  static random(): AudioUrls {
    return new AudioUrls(AudioUrlsMother.randomPrimitives());
  }

  static randomPrimitives(): AudioUrlsPrimitives {
    return {
      expression: {
        us: 'https://cdn.example.com/audio/us.mp3',
        uk: 'https://cdn.example.com/audio/uk.mp3',
        au: 'https://cdn.example.com/audio/au.mp3',
      },
      examples: {
        us: 'https://cdn.example.com/audio/example-us.mp3',
      },
    };
  }
}
