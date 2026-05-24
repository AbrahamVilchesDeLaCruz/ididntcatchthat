import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { LOGGER_SERVICE } from '@/shared/domain/logger';
import { HealthGetController } from '../controllers/health-get.controller';
import { PinoLogger } from '../logger/pino-logger';
import { GlobalExceptionRegistry } from '../exceptions/global-exception-registry';
import { HttpExceptionFilter } from '../exceptions/http-exception.filter';

@Module({
  controllers: [HealthGetController],
  providers: [
    {
      provide: LOGGER_SERVICE,
      useClass: PinoLogger,
    },
    GlobalExceptionRegistry,
    HttpExceptionFilter,
    {
      provide: APP_FILTER,
      useExisting: HttpExceptionFilter,
    },
  ],
  exports: [LOGGER_SERVICE, GlobalExceptionRegistry, HttpExceptionFilter],
})
export class SharedModule {}
