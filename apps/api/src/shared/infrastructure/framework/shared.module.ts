import { Module } from '@nestjs/common';
import { HealthGetController } from '../controllers/health-get.controller';

@Module({
  controllers: [HealthGetController],
})
export class SharedModule {}
