export type StudyLevelByModuleDto = {
  module: string;
  studyCoverage: number;
  studyLevel: number;
};

export interface StudyLevelQuery {
  findByUserId(userId: string): Promise<StudyLevelByModuleDto[]>;
}

export const STUDY_LEVEL_QUERY = Symbol('StudyLevelQuery');
