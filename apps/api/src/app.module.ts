import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObservabilityModule } from './observability/infrastructure/framework/observability.module';
import { SharedModule } from './shared/infrastructure/framework/shared.module';
import { IdentityModule } from './identity/shared/infrastructure/framework/identity.module';
import { ContentModule } from './content/shared/infrastructure/framework/content.module';
import { AppDataSource } from './shared/infrastructure/persistence/typeorm/typeorm.config';
import { envValidationSchema } from './shared/infrastructure/config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: false },
    }),
    TypeOrmModule.forRoot(AppDataSource.options),
    SharedModule,
    ObservabilityModule,
    IdentityModule,
    ContentModule,
  ],
})
export class AppModule {}
