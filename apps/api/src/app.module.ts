import { Module } from '@nestjs/common';
import { SharedModule } from './shared/infrastructure/framework/shared.module';

@Module({
  imports: [SharedModule],
})
export class AppModule {}
