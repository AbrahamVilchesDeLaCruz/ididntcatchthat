import { Module } from '@nestjs/common';
import { ObservabilityModule } from './observability/infrastructure/framework/observability.module';
import { SharedModule } from './shared/infrastructure/framework/shared.module';

@Module({
  imports: [SharedModule, ObservabilityModule],
})
export class AppModule {}
