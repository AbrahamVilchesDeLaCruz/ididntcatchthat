import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { type Logger, LOGGER_SERVICE } from './shared/domain/logger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // ─── CORS ──────────────────────────────────────────────────────────────────
  // CORS_ORIGIN: comma-separated list of allowed origins.
  // Defaults to localhost:5173 (Vite dev server) in non-production environments.
  const rawOrigins = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
  const allowedOrigins = rawOrigins.split(',').map((o) => o.trim());

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // required for cookies (refreshToken)
  });

  // ─── Global prefix ─────────────────────────────────────────────────────────
  // /health and /metrics are excluded — reachable without versioning prefix
  app.setGlobalPrefix('v1', { exclude: ['/health', '/metrics'] });

  // ─── Validation ────────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown properties
      forbidNonWhitelisted: true, // throw on unknown properties
      transform: true, // coerce query params / path params to declared types
      errorHttpStatusCode: 422, // validation errors → 422 Unprocessable Entity
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
      .addServer('https://dev.api.ididntcatchthat.com', 'Development')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true, // keeps the token across UI reloads
      },
    });
  }

  // ─── Start ─────────────────────────────────────────────────────────────────
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);

  const logger = app.get<Logger>(LOGGER_SERVICE);
  logger.info('API started', {
    port,
    env: process.env.NODE_ENV ?? 'development',
  });
}

void bootstrap();
