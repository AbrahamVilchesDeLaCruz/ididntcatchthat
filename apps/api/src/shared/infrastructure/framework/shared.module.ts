import { Module } from '@nestjs/common';
import { LOGGER_SERVICE } from '@/shared/domain/logger';
import { HealthGetController } from '../controllers/health-get.controller';
import { PinoLogger } from '../logger/pino-logger';

@Module({
  controllers: [HealthGetController],
  providers: [
    {
      provide: LOGGER_SERVICE,
      useClass: PinoLogger,
    },
  ],
  exports: [LOGGER_SERVICE],
})
export class SharedModule {}
