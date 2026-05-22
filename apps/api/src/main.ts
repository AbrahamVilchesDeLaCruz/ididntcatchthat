import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // ─── Global prefix ─────────────────────────────────────────────────────────
  // /health is excluded — it must be reachable without versioning for uptime monitors
  app.setGlobalPrefix('api/v1', { exclude: ['/health'] });

  // ─── Validation ────────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // strip unknown properties
      forbidNonWhitelisted: true, // throw on unknown properties
      transform: true,       // coerce query params / path params to declared types
    }),
  );

  // ─── Swagger / OpenAPI ─────────────────────────────────────────────────────
  // Only available in non-production environments — see ADR 022
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('ididntcatchthat API')
      .setDescription(
        'API for the gamified English phonetics learning platform',
      )
      .setVersion('1.0')
      .setContact('ididntcatchthat', 'https://ididntcatchthat.com', '')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT access token — expires in 15 minutes',
        },
        'access-token',
      )
      .addServer('http://localhost:3000', 'Local')
      .addServer('https://api.ididntcatchthat.com', 'Production')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true, // keeps the token across UI reloads
      },
    });
  }

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
