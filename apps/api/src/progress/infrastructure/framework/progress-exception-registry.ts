import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { GlobalExceptionRegistry } from '@/shared/infrastructure/exceptions/global-exception-registry';
import { ModuleNameInvalid } from '@/progress/domain/exceptions/module-name-invalid';

@Injectable()
export class ProgressExceptionRegistry implements OnModuleInit {
  constructor(private readonly globalRegistry: GlobalExceptionRegistry) {}

  onModuleInit(): void {
    this.globalRegistry.register(
      new Map<string, number>([
        [ModuleNameInvalid.name, HttpStatus.UNPROCESSABLE_ENTITY],
      ]),
    );
  }
}
