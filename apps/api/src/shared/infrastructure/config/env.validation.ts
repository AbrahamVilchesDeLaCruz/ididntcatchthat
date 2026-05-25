import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // App
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  PORT: Joi.number().default(3000),

  // Database
  DATABASE_URL: Joi.string().required(),

  // Auth
  JWT_SECRET: Joi.string().min(32).required(),

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

  // Cloudflare R2
  CLOUD_STORAGE: Joi.string().uri().required(),
  CLOUD_STORAGE_PUBLIC_URL: Joi.string().uri().required(),
  CLOUD_STORAGE_ACCESS_KEY_ID: Joi.string().required(),
  CLOUD_STORAGE_SECRET_ACCESS_KEY: Joi.string().required(),
  CLOUD_STORAGE_BUCKET: Joi.string().required(),
});
