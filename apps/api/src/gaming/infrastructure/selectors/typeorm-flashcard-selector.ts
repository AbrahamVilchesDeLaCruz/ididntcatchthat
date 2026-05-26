import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type FlashcardSelector } from '@/gaming/domain/flashcard-selector';
import { type GameModule } from '@/gaming/domain/game-module';
import { FlashcardEntity } from '@/content/flashcard/infrastructure/persistence/flashcard.entity';

@Injectable()
export class TypeOrmFlashcardSelector implements FlashcardSelector {
  constructor(
    @InjectRepository(FlashcardEntity)
    private readonly repo: Repository<FlashcardEntity>,
  ) {}

  async select(module: GameModule | null, count: number): Promise<string[]> {
    const qb = this.repo
      .createQueryBuilder('f')
      .select('f.id')
      .where("f.audio_status = 'ready'");

    if (module !== null) {
      qb.andWhere('f.category = :category', { category: module.value });
    }

    qb.orderBy('RANDOM()').limit(count);

    const result = await qb.getRawMany<{ f_id: string }>();
    return result.map((r) => r.f_id);
  }
}
