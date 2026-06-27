export enum GameSourceValue {
  Catalog = 'catalog',
  Weakest = 'weakest',
}

export class GameSource {
  private constructor(readonly value: GameSourceValue) {}

  static create(value: string): GameSource {
    if (!Object.values(GameSourceValue).includes(value as GameSourceValue)) {
      throw new Error(`Invalid game source: ${value}`);
    }
    return new GameSource(value as GameSourceValue);
  }

  static catalog(): GameSource {
    return new GameSource(GameSourceValue.Catalog);
  }

  static weakest(): GameSource {
    return new GameSource(GameSourceValue.Weakest);
  }

  isWeakest(): boolean {
    return this.value === GameSourceValue.Weakest;
  }
}
