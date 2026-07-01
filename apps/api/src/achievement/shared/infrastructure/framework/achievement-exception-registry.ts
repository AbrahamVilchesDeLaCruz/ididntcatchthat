import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { GlobalExceptionRegistry } from '@/shared/infrastructure/exceptions/global-exception-registry';
import { AchievementKeyUnknown } from '@/achievement/catalog/domain/exceptions/achievement-key-unknown';
import { AchievementKeyEmpty } from '@/achievement/shared/domain/exceptions/achievement-key-empty';
import { AchievementCategoryInvalid } from '@/achievement/shared/domain/exceptions/achievement-category-invalid';

@Injectable()
export class AchievementExceptionRegistry implements OnModuleInit {
  constructor(private readonly globalRegistry: GlobalExceptionRegistry) {}

  onModuleInit(): void {
    this.globalRegistry.register(
      new Map<string, number>([
        [AchievementKeyUnknown.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [AchievementKeyEmpty.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [AchievementCategoryInvalid.name, HttpStatus.UNPROCESSABLE_ENTITY],
      ]),
    );
  }
}
