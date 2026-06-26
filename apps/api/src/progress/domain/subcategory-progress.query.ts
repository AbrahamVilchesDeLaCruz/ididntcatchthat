import { type UserId } from '@/shared/domain/user-id';

export interface SubcategoryProgressDto {
  category: string;
  subcategory: string;
  totalAttempts: number;
  correctCount: number;
  accuracy: number;
}

export interface SubcategoryProgressQuery {
  findByUser(userId: UserId): Promise<SubcategoryProgressDto[]>;
}

export const SUBCATEGORY_PROGRESS_QUERY = Symbol('SubcategoryProgressQuery');
