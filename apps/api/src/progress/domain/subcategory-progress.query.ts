import { type UserId } from '@/shared/domain/user-id';

export interface SubcategoryProgress {
  category: string;
  subcategory: string;
  totalAttempts: number;
  correctCount: number;
  accuracy: number;
}

export interface SubcategoryProgressQuery {
  findByUser(userId: UserId): Promise<SubcategoryProgress[]>;
}

export const SUBCATEGORY_PROGRESS_QUERY = Symbol('SubcategoryProgressQuery');
