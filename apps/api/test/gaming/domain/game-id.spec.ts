import { GameId } from '@/gaming/domain/game-id';

describe('GameId', () => {
  it('should create a valid GameId from a UUID', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const gameId = new GameId(uuid);
    expect(gameId.value).toBe(uuid);
  });

  it('should generate a valid GameId via generate()', () => {
    const gameId = GameId.generate();
    expect(gameId).toBeInstanceOf(GameId);
    expect(gameId.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('should generate unique ids', () => {
    const id1 = GameId.generate();
    const id2 = GameId.generate();
    expect(id1.value).not.toBe(id2.value);
  });

  it('should throw when value is not a valid UUID', () => {
    expect(() => new GameId('not-a-uuid')).toThrow();
  });

  it('should throw when value is empty', () => {
    expect(() => new GameId('')).toThrow();
  });
});
