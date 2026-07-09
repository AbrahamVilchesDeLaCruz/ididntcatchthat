import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // App
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  PORT: Joi.number().default(3000),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:4001'),
  CORS_ORIGIN: Joi.string().default(
    'http://localhost:4001,http://localhost:5173',
  ),
  USE_STUB_ADAPTERS: Joi.boolean()
    .truthy('true', '1', 1)
    .falsy('false', '0', 0)
    .default(false),

  // Database
  DATABASE_URL: Joi.string().required(),
  DATABASE_CA_CERT: Joi.string().optional(),

  // Auth
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),

  // Google OAuth
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_CALLBACK_URL: Joi.string().uri().required(),

  // RabbitMQ
  AMQP_URI: Joi.string().required(),

  // DeepSeek
  DEEPSEEK_API_KEY: Joi.string().required(),

  // ElevenLabs
  ELEVEN_LABS_API_KEY: Joi.string().required(),
  ELEVENLABS_VOICE_ID_AMERICAN: Joi.string().required(),
  ELEVENLABS_VOICE_ID_BRITISH: Joi.string().required(),
  ELEVENLABS_VOICE_ID_AUSTRALIAN: Joi.string().required(),
  ELEVENLABS_MAX_CONCURRENT: Joi.number().integer().min(1).max(10).default(3),

  // Cloudflare R2
  CLOUD_STORAGE: Joi.string().uri().required(),
  CLOUD_STORAGE_PUBLIC_URL: Joi.string().uri().required(),
  CLOUD_STORAGE_ACCESS_KEY_ID: Joi.string().required(),
  CLOUD_STORAGE_SECRET_ACCESS_KEY: Joi.string().required(),
  CLOUD_STORAGE_BUCKET: Joi.string().required(),

  // Observability
  LOKI_URL: Joi.string().uri().optional(),
  LOG_LEVEL: Joi.string()
    .valid('trace', 'debug', 'info', 'warn', 'error', 'fatal')
    .default('info'),
});
