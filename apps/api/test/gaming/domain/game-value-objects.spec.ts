import { GameMode } from '@/gaming/domain/game-mode';
import { GameModule } from '@/gaming/domain/game-module';
import { CardCount } from '@/gaming/domain/card-count';
import { GameStatus } from '@/gaming/domain/game-status';

describe('GameMode', () => {
  it.each(['study', 'game'])('should accept valid mode: %s', (mode) => {
    const vo = GameMode.create(mode);
    expect(vo.value).toBe(mode);
  });

  it('should throw on invalid mode', () => {
    expect(() => GameMode.create('invalid')).toThrow();
  });
});

describe('GameModule', () => {
  it.each([
    'native_sounds',
    'connecting_words',
    'beautifying_sentences',
    'sounding_native',
    'random',
  ])('should accept valid module: %s', (mod) => {
    const vo = GameModule.create(mod);
    expect(vo.value).toBe(mod);
  });

  it('should throw on invalid module', () => {
    expect(() => GameModule.create('invalid')).toThrow();
  });
});

describe('CardCount', () => {
  it.each(['10', '20', '50'])('should accept valid count: %s', (count) => {
    const vo = CardCount.create(count);
    expect(vo.value).toBe(count);
  });

  it('should throw on invalid count', () => {
    expect(() => CardCount.create('15')).toThrow();
  });

  it('should throw on non-numeric string', () => {
    expect(() => CardCount.create('abc')).toThrow();
  });
});

describe('GameStatus', () => {
  it.each(['in_progress', 'paused', 'completed', 'abandoned'])(
    'should accept valid status: %s',
    (status) => {
      const vo = GameStatus.create(status);
      expect(vo.value).toBe(status);
    },
  );

  it('should throw on invalid status', () => {
    expect(() => GameStatus.create('unknown')).toThrow();
  });
});
