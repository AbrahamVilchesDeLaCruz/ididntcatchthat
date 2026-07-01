import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { GlobalExceptionRegistry } from '@/shared/infrastructure/exceptions/global-exception-registry';
import { PagePathInvalid } from '@/analytics/page-view/domain/exceptions/page-path-invalid';
import { VisitorIdInvalid } from '@/analytics/page-view/domain/exceptions/visitor-id-invalid';

@Injectable()
export class AnalyticsExceptionRegistry implements OnModuleInit {
  constructor(private readonly globalRegistry: GlobalExceptionRegistry) {}

  onModuleInit(): void {
    this.globalRegistry.register(
      new Map<string, number>([
        [PagePathInvalid.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [VisitorIdInvalid.name, HttpStatus.UNPROCESSABLE_ENTITY],
      ]),
    );
  }
}
