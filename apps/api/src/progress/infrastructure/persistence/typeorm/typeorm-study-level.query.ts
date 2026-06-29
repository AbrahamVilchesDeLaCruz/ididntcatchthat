import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { StudyLevel } from '@/progress/domain/study-level';
import {
  type StudyLevelByModuleDto,
  type StudyLevelQuery,
} from '@/progress/domain/study-level.query';

const MODULES = [
  'native_sounds',
  'connected_speech',
  'flow_connectors',
  'real_talk',
] as const;

interface Row {
  module: string;
  total: string;
  studied: string;
}

@Injectable()
export class TypeOrmStudyLevelQuery implements StudyLevelQuery {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findByUserId(userId: string): Promise<StudyLevelByModuleDto[]> {
    const rows = await this.dataSource.query<Row[]>(
      `SELECT
         f.category AS module,
         COUNT(DISTINCT f.id)::int AS total,
         COUNT(DISTINCT ufs.flashcard_id) FILTER (
           WHERE ufs.times_studied > 0
         )::int AS studied
       FROM flashcards f
       LEFT JOIN user_flashcard_stats ufs
         ON ufs.flashcard_id = f.id AND ufs.user_id = $1
       WHERE f.category = ANY($2::varchar[])
         AND f.audio_status = 'ready'
       GROUP BY f.category`,
      [userId, MODULES],
    );

    const byModule = new Map(rows.map((r) => [r.module, r]));

    return MODULES.map((module) => {
      const row = byModule.get(module);
      const total = Number(row?.total ?? 0);
      const studied = Number(row?.studied ?? 0);
      const studyCoverage = total === 0 ? 0 : studied / total;
      return {
        module,
        studyCoverage,
        studyLevel: StudyLevel.compute(studyCoverage),
      };
    });
  }
}
