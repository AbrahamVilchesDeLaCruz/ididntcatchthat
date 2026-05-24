import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObservabilityModule } from './observability/infrastructure/framework/observability.module';
import { SharedModule } from './shared/infrastructure/framework/shared.module';
import { IdentityModule } from './identity/shared/infrastructure/framework/identity.module';
import { AppDataSource } from './shared/infrastructure/persistence/typeorm/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(AppDataSource.options),
    SharedModule,
    ObservabilityModule,
    IdentityModule,
  ],
})
export class AppModule {}
