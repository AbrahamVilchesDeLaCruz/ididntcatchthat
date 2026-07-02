import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { GlobalExceptionRegistry } from '@/shared/infrastructure/exceptions/global-exception-registry';
import { RankingModuleRequired } from '@/ranking/shared/domain/exceptions/ranking-module-required';
import { RankingPeriodInvalid } from '@/ranking/shared/domain/exceptions/ranking-period-invalid';
import { RankingTypeInvalid } from '@/ranking/shared/domain/exceptions/ranking-type-invalid';

@Injectable()
export class RankingExceptionRegistry implements OnModuleInit {
  constructor(private readonly globalRegistry: GlobalExceptionRegistry) {}

  onModuleInit(): void {
    this.globalRegistry.register(
      new Map<string, number>([
        [RankingModuleRequired.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [RankingPeriodInvalid.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [RankingTypeInvalid.name, HttpStatus.UNPROCESSABLE_ENTITY],
      ]),
    );
  }
}
